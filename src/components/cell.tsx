const cellColors: Record<CellType, string> = {
  tile: '#FCFCFC',
  head: '#121214',
  body: '#50FFB5',
  fruit: '#FCFCFC',
}

interface CellProps extends Omit<Cell, 'id'> {
  zIndex?: number
}

export function Cell(props: CellProps): React.JSX.Element {
  const { type, posX, posY, zIndex } = props

  return (
    <div
      className="absolute flex size-6 flex-col items-center justify-center font-medium text-brown-600 transition-transform will-change-transform"
      style={
        type === 'head' || type === 'body'
          ? {
              top: 0,
              left: 0,
              transform: `translate(${25 * posX}px, ${25 * posY}px)`,
              backgroundColor: cellColors[type],
              zIndex,
            }
          : {
              top: 25 * posY,
              left: 25 * posX,
              backgroundColor: cellColors[type],
              zIndex,
            }
      }
    >
      {type === 'fruit' && (
        <img
          src="/images/fruit.png"
          alt="fruit"
          className="size-7 object-contain"
        />
      )}
    </div>
  )
}
