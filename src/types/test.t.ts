export interface LoginData {
  username: string,
  password: string
}

export interface CodeTemplate {
  id: string,
  lang: string
  name: string,
  code: string,
  tips: string
}

export interface ApiResult {
  code: Number,
  errMsg: string,
  data: Array<CodeTemplate>
}