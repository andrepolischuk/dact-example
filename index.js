import html from 'bel'
import morph from 'nanomorph'
import createData from 'dact'
import fetch from 'isomorphic-fetch'
import styles from './styles.css'

const initial = {
  users: [],
  error: null,
  fetching: false
}

const data = createData(initial)

async function addUser (login, data) {
  const exists = data.state.users.find(us => us.login === login)

  if (exists) {
    data.emit(handleError, `${login} already exists`)
    return
  }

  data.emit({
    error: null,
    fetching: true
  })

  const response = await fetch(`https://api.github.com/users/${login}`)
  const user = await response.json()

  data.emit({
    fetching: false,
    users: [
      ...data.state.users,
      user
    ]
  })
}

function deleteUser (login, data) {
  const users = data.state.users.filter(us => us.login !== login)

  return {
    users
  }
}

function handleError (error) {
  return {
    error
  }
}

function errorMessage (error, emit) {
  return error && html`
    <p class="${styles.error}">
      ${error}
     <button type="button" onclick=${() => emit(handleError, null)}>Close</button>
    </p>
  `
}

function userList (users, emit) {
  return users.map(user => html`
    <p>
      <a href="${user.html_url}">${user.name}</a>
      <small>${user.login}</small>
      <button onclick=${() => emit(deleteUser, user.login)}>Delete</button>
    </p>
  `)
}

function submit (event, emit) {
  const {value} = event.target.querySelector('input')

  event.preventDefault()

  if (value) {
    emit(addUser, value)
  }
}

function app (state, emit) {
  return html`
    <div class="${state.fetching ? styles.fetching : styles.normal}">
      <form onsubmit=${(event) => submit(event, emit)}>
        <input type="text" placeholder="Type github username..." tabindex="0" autofocus />
        <button type="submit">Add</button>
      </form>
      ${errorMessage(state.error, emit)}
      ${userList(state.users, emit)}
    </div>
  `
}

const root = document.getElementById('root')
let tree = root.appendChild(app(data.state, data.emit))

data.subscribe(() => {
  tree = morph(tree, app(data.state, data.emit))
})
