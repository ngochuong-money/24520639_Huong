import './CategoryFilter.css'

export const ALL_CATEGORIES = 'all'

function toLabel(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export default function CategoryFilter({ categories = [], activeCategory = ALL_CATEGORIES, onSelect }) {
  const options = [ALL_CATEGORIES, ...categories]

  return (
    <nav className="filter-row" aria-label="Photo categories">
      <ul className="nav-list">
        {options.map((slug) => {
          const isPressed = slug === activeCategory
          return (
            <li key={slug}>
              <button
                type="button"
                className={isPressed ? 'filter-button is-pressed' : 'filter-button'}
                aria-pressed={isPressed}
                onClick={() => onSelect(slug)}
              >
                {slug === ALL_CATEGORIES ? 'All' : toLabel(slug)}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
