<template>
  <div class="container">
    <div class="editor-container">
      <div id="editor" ref="editorContainer" class="monaco-editor"></div>
    </div>
    <div class="image-container">
      <div v-if="selectedLine">
        <div v-if="imageLoading" class="loader"></div>
        <img v-else :src="getImageUrl(selectedLine)" :alt="'变量截图 - 行 ' + selectedLine"
          :class="['variable-image', { loading: imageLoading }]" @load="imageLoading = false" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as monaco from 'monaco-editor';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const editorContainer = ref(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

const code = ref(`
package demo02;

import demo02.entity.Purchase;
import demo02.entity.Result;
import demo02.entity.Sale;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @Model: 应用 -
 * @Description: 计算价格区间，确保终止记录和所有有效采购正确划分
 * @Author: hyk
 * @Date: 2025/5/19
 */
public class PriceIntervalCalculator3 {

    public List<Result> computePriceIntervals(List<Purchase> purchases, List<Sale> sales) {
        Date currentDate = removeTime(new Date()); // 当前日期
        // Group purchases and sales
        Map<String, Map<String, List<Purchase>>> purchaseGroups = purchases.stream()
                .collect(Collectors.groupingBy(p -> p.itemId,
                        Collectors.groupingBy(p -> p.supId)));

        Map<String, List<Sale>> saleGroups = sales.stream()
                .collect(Collectors.groupingBy(s -> s.itemId));

        List<Result> results = new ArrayList<>();
        // 查询历史价格
        for (String itemId : purchaseGroups.keySet()) {
            Map<String, List<Purchase>> supMap = purchaseGroups.get(itemId);
            List<Sale> itemSales = saleGroups.getOrDefault(itemId, Collections.emptyList());

            for (String supId : supMap.keySet()) {
                // 每个SKU, 每家供应商
                List<Purchase> itemPurchases = supMap.get(supId);
                // 按照审核日期倒序排序
                itemPurchases.sort((p1, p2) -> p2.auditDate.compareTo(p1.auditDate));
                itemSales.sort((s1, s2) -> s2.auditDate.compareTo(s1.auditDate));

                Set<Date> timePoints = new TreeSet<>();
                Set<Date> deadLine = new TreeSet<>(); // 解绑记录
                // 1. 添加历史价格采购记录时间点
                for (Purchase p : itemPurchases) {
                    Date auditDate = removeTime(p.auditDate);
                    Date startDate = removeTime(p.startDate);
                    Date endDate = removeTime(p.endDate);
                    startDate = auditDate.compareTo(startDate) >= 0 ? auditDate : startDate;
                    endDate = auditDate.compareTo(endDate) >= 0 ? auditDate :  endDate;
                    if (auditDate.compareTo(endDate) >= 0 && endDate.compareTo(currentDate) <= 0) {
                        // 终止记录, 审核日期参与时间点划分
                        timePoints.add(auditDate);
                        deadLine.add(auditDate);
                    }
                    if (auditDate.compareTo(endDate) != 0) {
                        // 开始日期，结束日期参与时间点划分
                        Date effectStartDate = auditDate.after(startDate) ? auditDate : startDate;
                        if (effectStartDate.compareTo(currentDate) <= 0) {
                            timePoints.add(effectStartDate);
                        }
                        if (endDate.compareTo(currentDate) <= 0) {
                            timePoints.add(endDate);
                        }
                    }
                }
                // 2. 添加当前时间点
                if (!timePoints.contains(currentDate)) {
                    timePoints.add(currentDate);
                }
                // 3. 添加未来采购价格时间点， 从后往前找，直到找到解绑点位置
                for (Purchase p : itemPurchases) {
                    Date auditDate = removeTime(p.auditDate);
                    Date startDate = removeTime(p.startDate);
                    Date endDate = removeTime(p.endDate);
                    startDate = auditDate.compareTo(startDate) >= 0 ? auditDate : startDate;
                    endDate = auditDate.compareTo(endDate) >= 0 ? auditDate :  endDate;
                    if (auditDate.compareTo(endDate) >= 0) {
                        // 解绑记录
                        break;
                    }
                    // 开始日期，结束日期参与时间点划分
                    Date effectStartDate = auditDate.compareTo(startDate) >= 0 ? auditDate : startDate;
                    if (effectStartDate.compareTo(currentDate) >= 0) {
                        // 如果生效日期在当前时间点之后，则添加生效日期
                        timePoints.add(effectStartDate);
                    }
                    if (endDate.compareTo(currentDate) >= 0) {
                        // 如果结束日期在当前时间点之后，则添加结束日期
                        timePoints.add(removeTime(endDate));
                    }
                }
                // 4. 销售时间点
                for (Sale s : itemSales) {
                    Date auditDate = removeTime(s.auditDate);
                    Date startDate = removeTime(s.startDate);
                    Date endDate = removeTime(s.endDate);
                    startDate = auditDate.compareTo(startDate) >= 0 ? auditDate :  startDate;
                    if (auditDate.compareTo(startDate) > 0) {
                        break;
                    }

                    Date effectiveStart = auditDate.compareTo(s.startDate) >= 0 ? auditDate : startDate;
                    timePoints.add(effectiveStart);
                    timePoints.add(endDate);
                }
                if (timePoints.isEmpty()) {
                    continue;
                }
                // Step 4: Process intervals
                List<Date> sortedTimePoints = timePoints.stream().sorted(Date::compareTo).collect(Collectors.toList());
                for (int i = 0; i < sortedTimePoints.size() - 1; i++) {
                    Date start = sortedTimePoints.get(i); // 时间点开始日期
                    Date end = sortedTimePoints.get(i + 1); // 时间点结束日期

                    BigDecimal purchasePrice = BigDecimal.ZERO;
                    if (!deadLine.contains(start)) {
                        // 查询未来价格
                        if (start.compareTo(currentDate) >= 0) {
                            // 绝对不能跨越解绑点
                            for (Purchase p : itemPurchases) {
                                Date auditDate = removeTime(p.auditDate);
                                Date startDate = removeTime(p.startDate);
                                Date endDate = removeTime(p.endDate);
                                startDate = auditDate.compareTo(startDate) >= 0 ? auditDate : startDate;
                                endDate = auditDate.compareTo(endDate) >= 0 ? auditDate :  endDate;
                                if (auditDate.compareTo(endDate) >= 0) {
                                    break;
                                }
                                // 开始日期 >= 生效日期，且 结束日期 <= 失效日期
                                if (start.compareTo(startDate) >= 0 && end.compareTo(endDate) <= 0) {
                                    purchasePrice = p.price;
                                    break;
                                }
                            }
                        }
                        // 查询历史价格
                        if (end.compareTo(currentDate) <= 0) {
                            // 查询历史价格, 可以跨越解绑点
                            for (Purchase p : itemPurchases) {
                                Date auditDate = removeTime(p.auditDate);
                                Date startDate = removeTime(p.startDate);
                                Date endDate = removeTime(p.endDate);
                                startDate = auditDate.compareTo(startDate) >= 0 ? auditDate : startDate;
                                endDate = auditDate.compareTo(endDate) >= 0 ? auditDate :  endDate;

                                // 跳过这个时间点
                                if (auditDate.compareTo(endDate) >= 0) {
                                    continue;
                                }
                                // 开始日期 >= 生效日期，且 结束日期 <= 失效日期
                                if (start.compareTo(startDate) >= 0 && end.compareTo(endDate) <= 0) {
                                    purchasePrice = p.price;
                                    break;
                                }
                            }
                        }
                    } else {
                        // 解绑记录只能存在于历史区间中， 至于是否需要采购价格为0， 需要看当天有没有新的采购价目表
                        // 查询历史价格
                        if (end.compareTo(currentDate) <= 0) {
                            // 查询历史价格, 可以跨越解绑点
                            for (Purchase p : itemPurchases) {
                                Date auditDate = removeTime(p.auditDate);
                                Date startDate = removeTime(p.startDate);
                                Date endDate = removeTime(p.endDate);
                                startDate = auditDate.compareTo(startDate) >= 0 ? auditDate : startDate;
                                endDate = auditDate.compareTo(endDate) >= 0 ? auditDate :  endDate;

                                // 解绑记录， 且日期不匹配， 直接跳过
                                if (auditDate.compareTo(endDate) >= 0 && endDate.compareTo(start) != 0) {
                                    continue;
                                }
                                // 解绑日期和当前日期正匹配， 解绑点之前，还没有采购价格，那就是0
                                if (endDate.compareTo(start) == 0) {
                                    break;
                                }

                                // 开始日期 >= 生效日期，且 结束日期 <= 失效日期
                                if (start.compareTo(startDate) >= 0 && end.compareTo(endDate) <= 0) {
                                    purchasePrice = p.price;
                                    break;
                                }
                            }
                        }
                    }
                    // 寻找销售价格
                    BigDecimal salePrice = BigDecimal.ZERO;
                    for (Sale s : itemSales) {
                        Date sStart = s.auditDate.after(s.startDate) ? s.auditDate : s.startDate;
                        if (!start.before(sStart) && !end.after(s.endDate)) {
                            salePrice = s.price;
                            break;
                        }
                    }
                    // Only add result if at least one price is non-zero
                    if (purchasePrice.compareTo(BigDecimal.ZERO) > 0 || salePrice.compareTo(BigDecimal.ZERO) > 0) {
                        results.add(new Result(itemId, supId, start, end, purchasePrice, salePrice));
                    }
                }
            }
        }

        // Merge adjacent intervals
        List<Result> mergedResults = new ArrayList<>();
        if (!results.isEmpty()) {
            Result current = results.get(0);
            for (int i = 1; i < results.size(); i++) {
                Result next = results.get(i);
                if (canMerge(current, next)) {
                    current = new Result(
                            current.itemId,
                            current.supId,
                            current.start,
                            next.end,
                            current.purchasePrice,
                            current.salePrice
                    );
                } else {
                    mergedResults.add(current);
                    current = next;
                }
            }
            mergedResults.add(current);
        }

        // Sort results
        mergedResults.sort(Comparator
                .comparing(Result::getItemId)
                .thenComparing(Result::getSupId)
                .thenComparing(Result::getStart));

        return mergedResults;
    }

    /***
     * 移除时间
     * @param date 日期
     * @return 移除时间后的日期
     */
    private Date removeTime(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    private boolean canMerge(Result a, Result b) {
        return a.itemId.equals(b.itemId) &&
                a.supId.equals(b.supId) &&
                a.end.equals(b.start) &&
                a.purchasePrice.compareTo(b.purchasePrice) == 0 &&
                a.salePrice.compareTo(b.salePrice) == 0;
    }

    public static void main(String[] args) throws ParseException {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat sdtf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        List<Purchase> purchases = Arrays.asList(
                new Purchase("2165318911585682444", "2110211205200117801",
                        sdtf.parse("2025-04-01 00:00:00"), sdf.parse("2025-04-01"), sdf.parse("2099-12-31"), new BigDecimal("15")),
                new Purchase("2165318911585682444", "2110211205200117801",
                        sdtf.parse("2025-04-07 01:00:00"), sdf.parse("2025-04-01"), sdf.parse("2025-04-07"), new BigDecimal("15")),
                new Purchase("2165318911585682444", "2110211205200117801",
                        sdtf.parse("2025-05-22 01:00:00"), sdf.parse("2025-05-22"), sdf.parse("2099-12-31"), new BigDecimal("18")),
                new Purchase("2165318911585682444", "2110211205200117801",
                        sdtf.parse("2025-05-22 02:00:00"), sdf.parse("2025-07-01"), sdf.parse("2025-07-30"), new BigDecimal("10")),
                new Purchase("2165318911585682444", "2110211205200117801",
                        sdtf.parse("2025-05-22 03:00:00"), sdf.parse("2025-07-15"), sdf.parse("2025-07-20"), new BigDecimal("9")),
                new Purchase("2165318911585682444", "2110211205200117801",
                        sdtf.parse("2025-05-22 04:00:00"), sdf.parse("2025-09-01"), sdf.parse("2025-09-30"), new BigDecimal("8")),
                new Purchase("2165318911585682444", "2110211205200117801",
                        sdtf.parse("2025-05-22 05:00:00"), sdf.parse("2026-01-01"), sdf.parse("2026-09-30"), new BigDecimal("8")),
                new Purchase("2165318911585682444", "2110211205200117801",
                        sdtf.parse("2025-05-22 06:00:00"), sdf.parse("2026-02-01"), sdf.parse("2026-02-28"), new BigDecimal("9"))
//                new Purchase("2165318911585682444", "2110211205200117801",
//                        sdtf.parse("2025-05-22 13:00:00"), sdf.parse("2025-05-20"), sdf.parse("2025-05-21"), new BigDecimal("9")),
//                new Purchase("2165318911585682444", "2110211205200117801",
//                        sdtf.parse("2025-05-22 19:00:00"), sdf.parse("2025-05-22"), sdf.parse("2099-12-31"), new BigDecimal("19")),
//                new Purchase("2165318911585682444", "2110211205200117801",
//                        sdtf.parse("2025-05-22 20:00:00"), sdf.parse("2026-02-01"), sdf.parse("2026-02-28"), new BigDecimal("9"))
        );

        List<Sale> sales = Arrays.asList(
                new Sale("2165318911585682444",
                        sdtf.parse("2025-04-01 00:00:00"), sdf.parse("2025-04-01"), sdf.parse("2099-12-31"), new BigDecimal("20"))
        );

        PriceIntervalCalculator3 calculator = new PriceIntervalCalculator3();
        List<Result> results = calculator.computePriceIntervals(purchases, sales);

        // Print results with Chinese headers
        System.out.println("SKU, 供应商, 开始日期, 结束日期, 采购价格, 销售价格");
        results.forEach(System.out::println);
    }
}

`) // 代码模板
const selectedLine = ref<Number>() // 选择行
const imageLoading = ref<Boolean>(false) // 图片是否加载完
const linesWithImages = ref<Array<Number>>([1, 35]) // 存在图片的行号

const getImageUrl = (lineNumber: Number) => {
  // 替换为实际图片URL
  const baseUrl = 'http://localhost:8080/';
  return linesWithImages.value.includes(lineNumber)
    ? `${baseUrl}${lineNumber}.png`
    : '';
}


onMounted(() => {
  initMonaco();
})

onBeforeUnmount(() => {
  destroyEditor();
});

const initMonaco = () => {
  if (!editorContainer.value) return;

  editor = monaco.editor.create(editorContainer.value, {
    value: code.value,
    language: 'java',
    theme: 'vs-dark',
    readOnly: true,
    lineNumbers: 'on',
    fontSize: 15,
    padding: { top: 12, bottom: 12 },
    scrollBeyondLastLine: false,
  });

  editor.onMouseDown((e) => {
    const position = e.target.position;
    if (position) {
      imageLoading.value = true;
      setTimeout(() => {
        selectedLine.value = position.lineNumber;
        imageLoading.value = false;
      }, 400);
    }
  })
}

const destroyEditor = () => {
  if (editor) {
    editor.dispose();
  }
}
</script>

<style scoped>
.container {
  display: flex;
  height: 89vh;
  max-width: 2400px;
  margin: 0 auto;
  gap: 24px;
}

.editor-container {
  flex: 1.3;
  background: white;
  height: 84vh;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  padding: 24px;
  transition: transform 0.2s;
}

.image-container {
  flex: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

#editor {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.variable-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out;
}

.variable-image.loading {
  opacity: 0;
  transform: scale(0.95);
}

.highlight-line {
  background-color: var(--highlight-color) !important;
  transition: background-color 0.3s ease;
}

.image-line-highlight {
  background-color: var(--image-line-color) !important;
  transition: background-color 0.3s ease;
}

.no-image {
  color: #64748b;
  font-size: 1.2rem;
  text-align: center;
  padding: 2.5rem;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: 100%;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--breakpoint-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: 2rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>