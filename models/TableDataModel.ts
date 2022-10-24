export class TableDataModel {
    headers: Header[]
    fields: any[]

    constructor(headers: Header[], fields: any[]) {
        this.headers = headers
        this.fields = fields
    }
}

export class Header {
    text: string
    value: string
    ref? : boolean
    visible? : boolean
    readonly? : boolean
    refName? : string
    tblName? : string
    tblNameCirilic? : string
    type?: string
    //align?: string
}

