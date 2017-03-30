import html from 'bel'
import morph from 'nanomorph'
import createData from 'dact'
import fetch from 'isomorphic-fetch'
import styles from './styles.css'

const store = createData({
  users: [],
  fetching: false
})

const setFetching = store.transform(fetching => ({fetching}))

const getUser = store.transform(async (login, pull) => {
  setFetching(true)

  const response = await fetch(`https://api.github.com/users/${login}`)
  const user = await response.json()
  const users = pull().users.filter(us => us.login !== login)

  return {
    fetching: false,
    users: [
      ...users,
      user
    ]
  }
})

const deleteUser = store.transform((login, pull) => {
  const users = pull().users.filter(us => us.login !== login)

  return {
    users
  }
})

function submit(event) {
  const {value} = event.target.querySelector('input')

  if (value) {
    getUser(value)
  }

  event.preventDefault()
}

function userList(users) {
  return users.map(user => html`
    <p>
      <a href="${user.html_url}">${user.name}</a>
      <small>${user.login}</small>
      <button onclick=${() => deleteUser(user.login)}>Delete</button>
    </p>
  `)
}

function app(data) {
  return html`
    <div class="${data.fetching ? styles.fetching : styles.normal}">
      <form onsubmit=${submit}>
        <input type="text" placeholder="Type github username..." tabindex="0" autofocus />
        <button type="submit">Add</button>
      </form>
      ${userList(data.users)}
    </div>
  `
}

const root = document.getElementById('root')

store.subscribe(data => {
  const tree = root.lastChild
  const nextTree = app(data)

  root.replaceChild(morph(tree, nextTree), tree)
})

root.appendChild(app(store.pull()))
