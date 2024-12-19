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

export function generateFruit(tableSize: number, snake: Snake): Fruit {
  const row = Object.keys(Array.from({ length: tableSize })).map(Number)

  return generateCell('fruit', {
    id: 'fruit',
    posX: getRandomValue(
      row.filter(pos => !snake.some(cell => cell.posX === pos))
    ),
    posY: getRandomValue(
      row.filter(pos => !snake.some(cell => cell.posY === pos))
    ),
  })
}

export function generateSnake(tableSize: number): Snake {
  const snakePos = Math.round(tableSize / 2)

  return [
    generateCell('head', { posX: snakePos, posY: snakePos }),
    generateCell('body', { posX: snakePos - 1, posY: snakePos }),
    generateCell('body', { posX: snakePos - 2, posY: snakePos }),
  ]
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
