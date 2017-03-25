import html from 'bel'
import morph from 'nanomorph'
import createData from 'recd'
import fetch from 'isomorphic-fetch'
import styles from './styles.css'

const store = createData({
  users: [],
  fetching: false
})

const setFetching = store.transform((data, fetching) => data({fetching}))

const getUser = store.transform(async (data, login) => {
  setFetching(true)

  const response = await fetch(`https://api.github.com/users/${login}`)
  const user = await response.json()
  const users = data().users.filter(us => us.login !== login)

  return data({
    fetching: false,
    users: [
      ...users,
      user
    ]
  })
})

function onsubmit(event) {
  const {value} = event.target.querySelector('input')

  if (value) {
    getUser(value)
  }

  event.preventDefault()
}

function app(data) {
  return html`
    <div class="${data.fetching ? styles.fetching : styles.normal}">
      <form onsubmit=${onsubmit}>
        <input type="text" placeholder="Type github username..." tabindex="0" autofocus />
        <button type="submit">Add</button>
      </form>
      ${data.users.map(user => html`
        <p>
          <a href="${user.html_url}">${user.name}</a>
          <small>${user.login}</small>
        </p>
      `)}
    </div>
  `
}

const root = document.getElementById('root')

store.subscribe(() => {
  const tree = root.lastChild
  const nextTree = app(store.pull())

  root.replaceChild(morph(tree, nextTree), tree)
})

root.appendChild(app(store.pull()))
