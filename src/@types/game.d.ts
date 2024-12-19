type CellType = 'tile' | 'head' | 'body' | 'fruit'

interface Cell<TType extends CellType = CellType> {
  id: string
  type: TType
  posX: number
  posY: number
}

type Row = Cell<'tile'>[]

type Table = Row[]

type Fruit = Cell<'fruit'>

type Snake = Cell<'head' | 'body'>[]

type Direction = 'top' | 'bottom' | 'left' | 'right'
