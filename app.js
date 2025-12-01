import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'

const firebaseConfig = {
  apiKey: 'AIzaSyAmll4i3RPI_j-J7qWPkZIBYPoWEFqL9os',
  authDomain: 'nw-finance-2026.firebaseapp.com',
  projectId: 'nw-finance-2026',
  storageBucket: 'nw-finance-2026.firebasestorage.app',
  messagingSenderId: '234539651970',
  appId: '1:234539651970:web:1d14d3778831109634359b',
  measurementId: 'G-VV8QRLHKC9'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const rememberInput = document.getElementById('remember')
const togglePasswordBtn = document.getElementById('toggle-password')
const loginForm = document.getElementById('login-form')
const messageBox = document.getElementById('message')

const modal = document.getElementById('modal')
const openRegister = document.getElementById('open-register')
const closeModal = document.getElementById('close-modal')
const registerForm = document.getElementById('register-form')
const registerMessage = document.getElementById('register-message')

togglePasswordBtn.addEventListener('click', () => {
  const t = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password'
  passwordInput.setAttribute('type', t)
})

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  messageBox.textContent = ''
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()
  const remember = !!rememberInput.checked
  const validEmail = /.+@.+\..+/.test(email)
  const validPassword = /^[A-Za-z0-9]{6,}$/.test(password)
  if (!validEmail) { messageBox.textContent = '請輸入有效的電子郵件'; return }
  if (!validPassword) { messageBox.textContent = '密碼需至少6位英數組合'; return }
  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
    const res = await signInWithEmailAndPassword(auth, email, password)
    messageBox.textContent = '登入成功'
    window.location.href = './'
  } catch (err) {
    messageBox.textContent = '登入失敗：' + (err?.code || '未知錯誤')
  }
})

openRegister.addEventListener('click', (e) => {
  e.preventDefault()
  modal.setAttribute('aria-hidden', 'false')
})

closeModal.addEventListener('click', () => {
  modal.setAttribute('aria-hidden', 'true')
  registerForm.reset()
  registerMessage.textContent = ''
})

modal.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    modal.setAttribute('aria-hidden', 'true')
    registerForm.reset()
    registerMessage.textContent = ''
  }
})

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  registerMessage.textContent = ''
  const name = document.getElementById('reg-name').value.trim()
  const email = document.getElementById('reg-email').value.trim()
  const role = document.getElementById('reg-role').value
  const validEmail = /.+@.+\..+/.test(email)
  if (!name) { registerMessage.textContent = '請輸入姓名'; return }
  if (!validEmail) { registerMessage.textContent = '請輸入有效的電子郵件'; return }
  if (!role) { registerMessage.textContent = '請選擇角色'; return }
  try {
    await addDoc(collection(db, 'registration_requests'), {
      name,
      email,
      role,
      status: 'pending',
      createdAt: serverTimestamp()
    })
    registerMessage.textContent = '已送出申請'
    setTimeout(() => { modal.setAttribute('aria-hidden', 'true'); registerForm.reset(); registerMessage.textContent = '' }, 1200)
  } catch (err) {
    registerMessage.textContent = '送出失敗：' + (err?.code || '未知錯誤')
  }
})
