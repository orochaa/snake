import { nanoid } from 'nanoid'

export function getRandomValueBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomValue<T>(list: T[]): T {
  return list[getRandomValueBetween(0, list.length - 1)]
}

export function generateCell<TType extends CellType>(
  type: TType,
  params?: Partial<Omit<Cell<TType>, 'type'>>
): Cell<TType> {
  return { id: nanoid(), type, posX: 0, posY: 0, ...params }
}

export function generateRow(
  size: number,
  rowIndex: number,
  params?: Partial<Omit<Cell<'tile'>, 'id'>>
): Row {
  return Array.from<Cell<'tile'>>({ length: size }).map((_, colIndex) => ({
    id: nanoid(),
    type: 'tile',
    posY: rowIndex,
    posX: colIndex,
    ...params,
  }))
}

export function generateTable(size: number): Table {
  return Array.from({ length: size }).map((_, rowIndex) =>
    generateRow(size, rowIndex)
  )
}

export function generateFruit(table: Table, snake: Snake): Fruit {
  const emptyTiles = table.flatMap(row =>
    row.filter(tile => !snake.some(cell => comparePosition(tile, cell)))
  )
  const emptyTile = getRandomValue(emptyTiles)

  return generateCell('fruit', {
    id: 'fruit',
    posX: emptyTile.posX,
    posY: emptyTile.posY,
  })
}

export function generateSnake(tableSize: number): Snake {
  const snakePos = Math.round(tableSize / 2)
  const snakeSize = 3

  return Array.from({ length: snakeSize }).map((_, i) =>
    generateCell(i === 0 ? 'head' : 'body', {
      posX: snakePos - i,
      posY: snakePos,
    })
  )
}

export function comparePosition(a: Cell, b: Cell): boolean {
  return a.posX === b.posX && a.posY === b.posY
}

export function copyCell<TCell extends Cell>(
  cell: TCell,
  params: Partial<Omit<TCell, 'id'>>
): TCell {
  return { ...cell, ...params }
}
