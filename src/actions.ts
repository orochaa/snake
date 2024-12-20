import type { Dispatch, SetStateAction } from 'react'
import { generateSnake } from './utils'
import { comparePosition, copyCell, generateCell, generateFruit } from './utils'

function handleEdgeTeleport(params: {
  cell: Cell
  prevCell: Cell | undefined
  table: Table
  direction: Direction
}): { posX: number; posY: number } | null {
  const { cell, prevCell, direction, table } = params
  const lastCellPos = table.length - 1

  if (prevCell) {
    if (cell.posY === 0 && prevCell.posY === lastCellPos) {
      return { posX: cell.posX, posY: lastCellPos }
    }

    if (cell.posY === lastCellPos && prevCell.posY === 0) {
      return { posX: cell.posX, posY: 0 }
    }

    if (cell.posX === 0 && prevCell.posX === lastCellPos) {
      return { posX: lastCellPos, posY: cell.posY }
    }

    if (cell.posX === lastCellPos && prevCell.posX === 0) {
      return { posX: 0, posY: cell.posY }
    }
  } else {
    if (cell.posY === 0 && direction === 'top') {
      return { posX: cell.posX, posY: lastCellPos }
    }

    if (cell.posY === lastCellPos && direction === 'bottom') {
      return { posX: cell.posX, posY: 0 }
    }

    if (cell.posX === 0 && direction === 'left') {
      return { posX: lastCellPos, posY: cell.posY }
    }

    if (cell.posX === lastCellPos && direction === 'right') {
      return { posX: 0, posY: cell.posY }
    }
  }

  return null
}

function handleMove(params: {
  cell: Cell<'head' | 'body'>
  prevCell: Cell<'head' | 'body'> | undefined
  direction: Direction
  table: Table
}): Cell<'head' | 'body'> {
  const { cell, prevCell, direction } = params

  const edgeTeleportPos = handleEdgeTeleport(params)

  if (edgeTeleportPos) {
    return generateCell(cell.type, edgeTeleportPos)
  }

  if (prevCell) {
    return copyCell(cell, { posX: prevCell.posX, posY: prevCell.posY })
  }

  const posY =
    cell.posY + (direction === 'bottom' ? 1 : direction === 'top' ? -1 : 0)
  const posX =
    cell.posX + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0)

  return copyCell(cell, { posX, posY })
}

function isGameOver(head: Cell, body: Snake): boolean {
  return body.some(cell => comparePosition(cell, head))
}

function growSnake(newSnake: Snake, direction: Direction): void {
  const tail = newSnake[newSnake.length - 1]

  newSnake.push(
    generateCell('body', {
      posY:
        tail.posY + (direction === 'bottom' ? 1 : direction === 'top' ? -1 : 0),
      posX:
        tail.posX + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
    })
  )
}

function updateSnake(params: {
  snake: Snake
  initialSnake: Snake
  direction: Direction
  table: Table
  fruit: Fruit
  setFruit: Dispatch<SetStateAction<Fruit>>
  setScore: Dispatch<SetStateAction<number>>
  setBestScore: Dispatch<SetStateAction<number>>
  setDirection: Dispatch<SetStateAction<Direction | undefined>>
  setLost: Dispatch<SetStateAction<boolean>>
}): Snake {
  const {
    snake,
    initialSnake,
    direction,
    table,
    fruit,
    setFruit,
    setScore,
    setBestScore,
    setDirection,
    setLost,
  } = params
  const newSnake: Snake = []

  for (let i = 0; i < snake.length; i++) {
    const cell = snake[i]
    const prevCell = i > 0 ? snake[i - 1] : undefined
    newSnake.push(
      handleMove({
        cell,
        prevCell,
        direction,
        table,
      })
    )
  }

  const head = newSnake[0]
  const body = newSnake.slice(1)

  if (comparePosition(head, fruit)) {
    growSnake(newSnake, direction)
    setFruit(generateFruit(table, newSnake))
    const newScore = newSnake.length - initialSnake.length
    setScore(newScore)
    setBestScore(bestScore => {
      if (newScore > bestScore) {
        localStorage.setItem('best-snake-score', String(newScore))

        return newScore
      }

      return bestScore
    })

    return newSnake
  }

  if (isGameOver(head, body)) {
    clearInterval(intervalId)
    setDirection(undefined)
    setLost(true)
    lostModal.current?.openModal()

    return newSnake
  }

  return newSnake
}

function prevent180(
  direction: Direction | undefined,
  desiredDirection: Direction,
  blockedDirection: Direction
): Direction {
  return direction === blockedDirection ? direction : desiredDirection
}

interface ActionsParams {
  table: Table
  fruit: Fruit
  setTable: Dispatch<SetStateAction<Table>>
  setFruit: Dispatch<SetStateAction<Fruit>>
  setSnake: Dispatch<SetStateAction<Snake>>
  setScore: Dispatch<SetStateAction<number>>
  setBestScore: Dispatch<SetStateAction<number>>
  setDirection: Dispatch<SetStateAction<Direction | undefined>>
  setLost: Dispatch<SetStateAction<boolean>>
}

interface Actions {
  startGame: () => void
  move: (direction: Direction) => void
  moveTop: () => void
  moveBottom: () => void
  moveLeft: () => void
  moveRight: () => void
}

export function generateActions(params: ActionsParams): Actions {
  const {
    table,
    fruit,
    setTable,
    setSnake,
    setFruit,
    setScore,
    setBestScore,
    setDirection,
    setLost,
    setPause,
  } = params

  const tableSize = table.length

  return {
    startGame(): void {
      const snake = generateSnake(tableSize)
      setSnake(snake)
      setFruit(generateFruit(table, snake))
      setDirection(undefined)
      setLost(false)
      setScore(0)
    },
    moveTop(): void {
      setDirection(prevent180('top', 'bottom'))
    },
    moveBottom(): void {
      setDirection(prevent180('bottom', 'top'))
    },
    moveLeft(): void {
      setDirection(prevent180('left', 'right'))
    },
    moveRight(): void {
      setDirection(prevent180('right', 'left'))
    },
    move: (direction: Direction): void => {
      setSnake(snake =>
        updateSnake({
          snake,
          direction,
          table,
        })
      )
    },
  }
}
