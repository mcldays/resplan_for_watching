// модель данных для TreeView
export class TreeViewDataModel {
    // ключ записи
    id: number
    // отображаемое имя элемента
    name: string
    // уникальный ключ позиции(обязательно необходим для v-treeview-item)
    key: number
    // номер позиции в списке (для сортировки)
    number: string
    // узел потомка
    children?: TreeChild[]

    constructor(id: number, name: string, key: number, number: string, children?: TreeChild[]) {
        this.id = id
        this.name = name
        this.key = key
        this.number = number
        this.children = children
    }
}

// потомок родителя TreeView
export class TreeChild {
    // ключ записи
    id: number
    // отображаемое имя элемента
    name: string
    // id родительского узла
    parentId: number
    // искусственный индекс, позволяет определить начальный порядок элементов потомка
    index: number
    // номер позиции в списке (для сортировки)
    number: string
    // потомок потомка
    children?: TreeChild[]
}

// родитель TreeView
export class TreeParent {
    // ключ записи
    id: number
    // отображаемое имя элемента
    name: string
    // уникальный ключ для v-treeView-item
    key: number
    // номер позиции в списке (для сортировки)
    number: string
    // потомок потомка
    children?: TreeChild[]
}

