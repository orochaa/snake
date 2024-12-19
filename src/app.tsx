import { useEffect, useState } from 'react'
import { FaQuestion } from 'react-icons/fa'
import { ImGithub } from 'react-icons/im'
import { Cell } from './components/cell'
import {
  copyCell,
  generateCell,
  generateFruit,
  generateSnake,
  generateTable,
  isSamePosition,
} from './utils'

const initialSize = 17
const initialTable = generateTable(initialSize)
const initialSnake = generateSnake(initialSize)
const initialFruit = generateFruit(initialSize, initialSnake)

export function App(): React.JSX.Element {
  const [table, setTable] = useState<Table>(initialTable)
  const [tableSize, setTableSize] = useState<number>(initialSize)
  const [snake, setSnake] = useState<Snake>(initialSnake)
  const [fruit, setFruit] = useState<Fruit>(initialFruit)
  const [direction, setDirection] = useState<Direction>()
  const [score, setScore] = useState<number>(0)
  const [bestScore, setBestScore] = useState<number>(0)

  useEffect(() => {
    if (!direction) {
      return
    }

    // eslint-disable-next-line prefer-const
    let intervalId: NodeJS.Timeout

    const updateSnake = (snake: Snake): Snake => {
      const newSnake: Snake = []
      const lastCellPos = tableSize - 1

      for (let i = 0; i < snake.length; i++) {
        const cell = snake[i]
        const prevCell = i > 0 ? snake[i - 1] : undefined

        if (prevCell) {
          if (cell.posY === 0 && prevCell.posY === lastCellPos) {
            newSnake.push(
              generateCell(cell.type, {
                posX: cell.posX,
                posY: lastCellPos,
              })
            )

            continue
          }

          if (cell.posY === lastCellPos && prevCell.posY === 0) {
            newSnake.push(
              generateCell(cell.type, {
                posX: cell.posX,
                posY: 0,
              })
            )

            continue
          }

          if (cell.posX === 0 && prevCell.posX === lastCellPos) {
            newSnake.push(
              generateCell(cell.type, {
                posX: lastCellPos,
                posY: cell.posY,
              })
            )

            continue
          }

          if (cell.posX === lastCellPos && prevCell.posX === 0) {
            newSnake.push(
              generateCell(cell.type, {
                posX: 0,
                posY: cell.posY,
              })
            )

            continue
          }

          newSnake.push(
            copyCell(cell, {
              posX: prevCell.posX,
              posY: prevCell.posY,
            })
          )

          continue
        }

        if (cell.posY === 0 && direction === 'top') {
          newSnake.push(
            generateCell(cell.type, {
              posX: cell.posX,
              posY: lastCellPos,
            })
          )

          continue
        }

        if (cell.posY === lastCellPos && direction === 'bottom') {
          newSnake.push(
            generateCell(cell.type, {
              posX: cell.posX,
              posY: 0,
            })
          )

          continue
        }

        if (cell.posX === 0 && direction === 'left') {
          newSnake.push(
            generateCell(cell.type, {
              posX: lastCellPos,
              posY: cell.posY,
            })
          )

          continue
        }

        if (cell.posX === lastCellPos && direction === 'right') {
          newSnake.push(
            generateCell(cell.type, {
              posX: 0,
              posY: cell.posY,
            })
          )

          continue
        }

        const posY =
          cell.posY +
          (direction === 'bottom' ? 1 : direction === 'top' ? -1 : 0)
        const posX =
          cell.posX +
          (direction === 'left' ? -1 : direction === 'right' ? 1 : 0)

        newSnake.push(
          copyCell(cell, {
            posY,
            posX,
          })
        )
      }

      const head = newSnake[0]
      const tail = newSnake[newSnake.length - 1]

      const isGameOver = newSnake
        .slice(1, -1)
        .some(cell => isSamePosition(cell, head))

      if (isGameOver) {
        clearInterval(intervalId)
        alert('end game')

        return newSnake
      }

      if (isSamePosition(head, fruit)) {
        newSnake.push(
          generateCell('body', {
            posY:
              tail.posY +
              (direction === 'bottom' ? 1 : direction === 'top' ? -1 : 0),
            posX:
              tail.posX +
              (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
          })
        )
        setFruit(generateFruit(tableSize, newSnake))
        const newScore = newSnake.length
        setScore(newScore)
        setBestScore(bestScore => {
          if (newScore > bestScore) {
            localStorage.setItem('best-snake-score', String(newScore))

            return newScore
          }

          return bestScore
        })
      }

      return newSnake
    }

    updateSnake(snake)

    intervalId = setInterval(() => setSnake(updateSnake), 100)

    return (): void => {
      clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, fruit])

  useEffect(() => {
    const handleDirection = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault()
          setDirection('top')
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          setDirection('bottom')
          break
        case 'ArrowLeft':
        case 'a':
          e.preventDefault()
          setDirection('left')
          break
        case 'ArrowRight':
        case 'd':
          e.preventDefault()
          setDirection('right')
          break
      }
    }

    document.addEventListener('keydown', handleDirection)

    return (): void => {
      document.removeEventListener('keydown', handleDirection)
    }
  }, [])

  useEffect(() => {
    const savedBestScore = localStorage.getItem('best-snake-score')

    if (savedBestScore) {
      setBestScore(Number(savedBestScore))
    }
  }, [])

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-cyan-800 font-rubik">
      <div className="mx-auto my-10 w-11/12">
        <h1 className="text-center text-7xl font-semibold text-slate-400 drop-shadow">
          Snake
        </h1>

        <div className="relative mx-auto mt-4 flex w-fit flex-col gap-4">
          <div className="mx-auto flex flex-wrap justify-center gap-3 md:absolute md:-right-52 md:top-0 md:flex-col">
            <div className="relative">
              <img
                src="/assets/scoreboard.png"
                alt="Scoreboard"
                className="w-48"
              />
              <div className="absolute inset-0 flex flex-col justify-center text-center">
                <span className="text-sm md:text-lg">Pontuação</span>
                <span className="text-md md:text-xl">{snake.length}</span>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/scoreboard.png"
                alt="Scoreboard"
                className="w-48"
              />
              <div className="absolute inset-0 flex flex-col justify-center text-center">
                <span className="text-sm md:text-lg">Maior Pontuação</span>
                <span className="text-md md:text-xl">{bestScore}</span>
              </div>
            </div>
            <div className="flex items-stretch justify-evenly gap-2 rounded-lg bg-cyan-700 p-2 drop-shadow">
              <a
                href="https://github.com/orochaa/snake"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center rounded-lg bg-neutral-100 p-2 text-zinc-600 hover:bg-neutral-200"
                title="Abrir repositório no GitHub"
              >
                <ImGithub size={28} className="text-zinc-800" />
              </a>
              <button
                type="button"
                className="flex items-center rounded-lg bg-neutral-100 p-2 text-zinc-600 hover:bg-neutral-200"
                title="Como jogar?"
              >
                <FaQuestion size={24} className="text-zinc-800" />
              </button>
            </div>
          </div>

          <div className="relative mx-auto rounded-lg border-2 border-black bg-[#9d8f84] p-3 shadow">
            <div
              className="relative overflow-hidden border-2 border-black"
              style={{ width: 25 * tableSize, height: 25 * tableSize }}
            >
              {table.map(row =>
                row.map(cell => <Cell key={cell.id} {...cell} />)
              )}

              <Cell key={fruit.id} {...fruit} />

              {snake.map((cell, i) => (
                <Cell key={cell.id} {...cell} zIndex={snake.length - i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
