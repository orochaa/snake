import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaQuestion } from 'react-icons/fa'
import { ImGithub } from 'react-icons/im'
import { LuGrid2X2Plus } from 'react-icons/lu'
import { MdPause, MdPlayArrow, MdRestartAlt } from 'react-icons/md'
import { generateActions } from './actions'
import { Cell } from './components/cell'
import { Modal, useModal } from './components/modal'
import { generateFruit, generateSnake, generateTable } from './utils'

const initialSize = 17
const initialTable = generateTable(initialSize)
const initialSnake = generateSnake(initialSize)
const initialFruit = generateFruit(initialTable, initialSnake)

export function App(): React.JSX.Element {
  const [table, setTable] = useState<Table>(initialTable)
  const [tableSize, setTableSize] = useState<number>(initialSize)
  const [snake, setSnake] = useState<Snake>(initialSnake)
  const [fruit, setFruit] = useState<Fruit>(initialFruit)
  const [direction, setDirection] = useState<Direction>()
  const [score, setScore] = useState<number>(0)
  const [bestScore, setBestScore] = useState<number>(0)

  const [pause, setPause] = useState<boolean>(false)
  const [lost, setLost] = useState<boolean>(false)

  const actions = useMemo(
    () =>
      generateActions({
        table,
        fruit,
        setTable,
        setSnake,
        setFruit,
        setScore,
        setBestScore,
        setDirection,
        setLost,
      }),
    [fruit, table]
  )

  const selectSizeModal = useModal()
  const lostModal = useModal()
  const howToPlayModal = useModal()

  const handleOpenSelectSizeModal = useCallback(() => {
    selectSizeModal.current?.openModal()
  }, [selectSizeModal])

  const handleSelectSize = useCallback((size: number) => {
    setTableSize(size)
    setTable(generateTable(size))
  }, [])

  const handleRestartGame = useCallback(() => {
    lostModal.current?.closeModal()
    actions.startGame()
    setPause(false)
  }, [actions, lostModal])

  const handleTogglePause = useCallback(() => {
    setPause(pause => !pause)
  }, [])

  const handleOpenHowToPlayModal = useCallback(() => {
    howToPlayModal.current?.openModal()
  }, [howToPlayModal])

  const handleCloseHowToPlayModal = useCallback(() => {
    howToPlayModal.current?.closeModal()
  }, [howToPlayModal])

  useEffect(() => {
    if (!direction || pause || lost) {
      return
    }

    updateSnake(snake)

    const intervalId = setInterval(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!direction || pause || lost) {
          clearInterval(intervalId)

          return
        }
        setSnake(updateSnake)
      },
      Math.max(300 - score * 12.5, 100)
    )

    return (): void => {
      clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, fruit, lost, pause])

  useEffect(() => {
    const handleDirection = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault()
          actions.moveTop()
          setPause(false)
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          actions.moveBottom()
          setPause(false)
          break
        case 'ArrowLeft':
        case 'a':
          e.preventDefault()
          actions.moveLeft()
          setPause(false)
          break
        case 'ArrowRight':
        case 'd':
          e.preventDefault()
          actions.moveRight()
          setPause(false)
          break
        case 'Escape':
        case ' ':
          e.preventDefault()
          handleTogglePause()
          break
      }
    }

    document.addEventListener('keydown', handleDirection)

    return (): void => {
      document.removeEventListener('keydown', handleDirection)
    }
  }, [actions, handleTogglePause])

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
                src="/images/scoreboard.png"
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
                src="/images/scoreboard.png"
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
                onClick={handleOpenHowToPlayModal}
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

              {!!pause && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/20"
                  style={{ width: 25 * tableSize, height: 25 * tableSize }}
                >
                  <MdPause className="size-24 text-cyan-500" />
                </div>
              )}
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
              title={`${pause ? 'Retomar' : 'Pausar'} jogo`}
              className="rounded-lg bg-neutral-100 p-2 text-zinc-600 hover:bg-neutral-200"
              onClick={handleTogglePause}
            >
              {pause ? <MdPlayArrow size={32} /> : <MdPause size={32} />}
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

      <Modal ref={howToPlayModal}>
        <h2 className="text-center text-lg font-medium text-zinc-800">
          Como jogar?
        </h2>
        <div className="mt-1 flex max-w-96 flex-col gap-2 text-pretty">
          <p>
            O jogo da cobrinha é um clássico dos videogames, conhecido por sua
            jogabilidade simples e divertida. Supere desafios crescentes à
            medida que a cobra cresce, exigindo reflexos rápidos e estratégias
            inteligentes para evitar colisões.
          </p>
          <p>
            <span className="font-semibold text-zinc-600">Objetivo:</span> O
            objetivo do jogo é controlar a cobra para comer as frutas, fazendo-a
            crescer o máximo possível sem colidir consigo mesma.
          </p>
          <p>
            <span className="font-semibold text-zinc-600">Ações:</span> Use as
            setas do teclado para mover a cobra para cima, para baixo, para a
            esquerda ou para a direita. Cada fruta coletada aumenta o tamanho da
            cobra e sua pontuação. Continue movendo-se e coletando frutas para
            crescer e atingir a maior pontuação possível.
          </p>
          <p>
            <span className="font-semibold text-zinc-600">Fim de jogo:</span> O
            jogo termina se a cobra colidir consigo mesma. Boa sorte!
          </p>
        </div>
        <button
          type="button"
          className="mt-4 block w-full rounded bg-neutral-200 p-2 hover:bg-neutral-300"
          onClick={handleCloseHowToPlayModal}
        >
          Continuar
        </button>
      </Modal>
    </div>
  )
}
