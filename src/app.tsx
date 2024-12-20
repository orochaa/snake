import { useCallback, useEffect, useState } from 'react'
import { FaQuestion } from 'react-icons/fa'
import { ImGithub } from 'react-icons/im'
import { LuGrid2X2Plus } from 'react-icons/lu'
import { MdRestartAlt } from 'react-icons/md'
import { Cell } from './components/cell'
import { Modal, useModal } from './components/modal'
import {
  comparePosition,
  copyCell,
  generateCell,
  generateFruit,
  generateSnake,
  generateTable,
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
  const [lost, setLost] = useState<boolean>(false)

  const selectSizeModal = useModal()
  const lostModal = useModal()

  const handleOpenSelectSizeModal = useCallback(() => {
    selectSizeModal.current?.openModal()
  }, [selectSizeModal])

  const handleSelectSize = useCallback((size: number) => {
    setTableSize(size)
    setTable(generateTable(size))
  }, [])

  const handleRestartGame = useCallback(() => {
    const snake = generateSnake(tableSize)
    setSnake(snake)
    setFruit(generateFruit(tableSize, snake))
    setDirection(undefined)
    setLost(false)
    lostModal.current?.closeModal()
  }, [lostModal, tableSize])

  useEffect(() => {
    if (!direction || lost) {
      return
    }

    // eslint-disable-next-line prefer-const
    let intervalId: NodeJS.Timeout

    const updateSnake = (snake: Snake): Snake => {
      const newSnake: Snake = []
      const lastCellPos = tableSize - 1

      const handleTeleport = (
        cell: Cell,
        prevCell?: Cell
      ): {
        posX: number
        posY: number
      } | null => {
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

      const moveCell = (
        cell: Cell<'head' | 'body'>,
        prevCell: Cell<'head' | 'body'> | undefined
      ): Cell<'head' | 'body'> => {
        const teleportPos = handleTeleport(cell, prevCell)

        if (teleportPos) {
          return generateCell(cell.type, teleportPos)
        }

        if (prevCell) {
          return copyCell(cell, { posX: prevCell.posX, posY: prevCell.posY })
        }

        const posY =
          cell.posY +
          (direction === 'bottom' ? 1 : direction === 'top' ? -1 : 0)
        const posX =
          cell.posX +
          (direction === 'left' ? -1 : direction === 'right' ? 1 : 0)

        return copyCell(cell, { posX, posY })
      }

      const isGameOver = (head: Cell, body: Snake): boolean => {
        return body.some(cell => comparePosition(cell, head))
      }

      const growSnake = (newSnake: Snake): void => {
        const tail = newSnake[newSnake.length - 1]

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
      }

      for (let i = 0; i < snake.length; i++) {
        const cell = snake[i]
        const prevCell = i > 0 ? snake[i - 1] : undefined
        newSnake.push(moveCell(cell, prevCell))
      }

      const head = newSnake[0]
      const body = newSnake.slice(1)

      if (isGameOver(head, body)) {
        clearInterval(intervalId)
        setDirection(undefined)
        setLost(true)
        lostModal.current?.openModal()

        return newSnake
      }

      if (comparePosition(head, fruit)) {
        growSnake(newSnake)
        setFruit(generateFruit(tableSize, newSnake))
        const newScore = newSnake.length - initialSnake.length
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

    intervalId = setInterval(
      () => setSnake(updateSnake),
      Math.max(300 - score * 12.5, 100)
    )

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
          setDirection(direction =>
            direction === 'bottom' ? direction : 'top'
          )
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          setDirection(direction =>
            direction === 'top' ? direction : 'bottom'
          )
          break
        case 'ArrowLeft':
        case 'a':
          e.preventDefault()
          setDirection(direction =>
            !direction || direction === 'right' ? direction : 'left'
          )
          break
        case 'ArrowRight':
        case 'd':
          e.preventDefault()
          setDirection(direction =>
            direction === 'left' ? direction : 'right'
          )
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
                <span className="text-md md:text-xl">{score}</span>
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
              className="relative overflow-hidden border-2 border-dashed border-black"
              style={{ width: 25 * tableSize, height: 25 * tableSize }}
            >
              {table.map(row =>
                row.map(tile => <Cell key={tile.id} {...tile} />)
              )}

              <Cell key={fruit.id} {...fruit} />

              {snake.map((cell, i) => (
                <Cell key={cell.id} {...cell} zIndex={snake.length - i} />
              ))}
            </div>
          </div>

          <div className="mx-auto flex w-fit gap-2 rounded-lg bg-cyan-700 p-1.5 drop-shadow">
            <button
              type="button"
              title="Escolher tabuleiro"
              className="rounded-lg bg-neutral-100 p-2 text-zinc-600 hover:bg-neutral-200"
              onClick={handleOpenSelectSizeModal}
            >
              <LuGrid2X2Plus size={32} />
            </button>
            <button
              type="button"
              title="Reiniciar jogo"
              className="rounded-lg bg-neutral-100 p-2 text-zinc-600 hover:bg-neutral-200"
              onClick={handleRestartGame}
            >
              <MdRestartAlt size={32} />
            </button>
          </div>
        </div>
      </div>

      <Modal ref={selectSizeModal}>
        <h2 className="text-lg font-medium text-zinc-800">
          Selecionar tabuleiro:
        </h2>
        <div className="mt-2 grid min-w-80 grid-cols-2 items-start gap-4">
          {Array.from({ length: 4 }).map((_, i) => {
            const size = initialSize + i * 2

            return (
              <button
                key={size}
                type="button"
                title={`Selecionar tabuleiro ${size}x${size}`}
                className="transition duration-100 hover:scale-[1.01]"
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => handleSelectSize(size)}
              >
                <span className="block text-center text-sm font-medium text-zinc-600">
                  {size}x{size}
                </span>
                <div className="mx-auto w-fit rounded border border-black bg-[#9d8f84] p-1 shadow">
                  <div
                    className="grid gap-[1px] overflow-hidden border border-black"
                    style={{
                      gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: size * size }).map((_, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <span key={i} className="size-2 bg-zinc-100" />
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Modal>

      <Modal ref={lostModal}>
        <h2 className="text-center text-lg font-medium text-zinc-800">
          Fim de jogo
        </h2>
        <p className="mt-1 max-w-72 text-center">
          O jogo chegou ao fim porque não há mais movimentos possíveis para
          combinar os blocos e criar um novo espaço vazio no tabuleiro.
        </p>
        <button
          type="button"
          className="mx-auto mt-4 block rounded bg-neutral-200 p-2 hover:bg-neutral-300"
          onClick={handleRestartGame}
        >
          Tentar Novamente
        </button>
      </Modal>
    </div>
  )
}
