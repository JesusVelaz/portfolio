export function Reveal({ children, as = 'div', delay: _delay = 0, className, ...rest }) {
  const Tag = as
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  )
}
