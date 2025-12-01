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

const eyeIcon = (
  '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + '<path d="M1 12c3-5 8-8 11-8s8 3 11 8c-3 5-8 8-11 8s-8-3-11-8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<circle cx="12" cy="12" r="3" fill="currentColor"/>'
  + '</svg>'
)
const eyeOffIcon = (
  '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + '<path d="M1 12c3-5 8-8 11-8s8 3 11 8c-3 5-8 8-11 8s-8-3-11-8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<path d="M4 4L20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  + '</svg>'
)

const setPasswordIcon = () => {
  if (passwordInput.getAttribute('type') === 'password') {
    togglePasswordBtn.innerHTML = eyeIcon
    togglePasswordBtn.setAttribute('aria-label', '顯示密碼')
  } else {
    togglePasswordBtn.innerHTML = eyeOffIcon
    togglePasswordBtn.setAttribute('aria-label', '隱藏密碼')
  }
}

setPasswordIcon()

togglePasswordBtn.addEventListener('click', () => {
  const t = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password'
  passwordInput.setAttribute('type', t)
  setPasswordIcon()
})

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  messageBox.textContent = ''
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()
  const remember = !!rememberInput.checked
  const validEmail = /.+@.+\..+/.test(email)
  const validPassword = /^(?:[A-Za-z]{6,}|\d{6,}|[A-Za-z0-9]{6,})$/.test(password)
  if (!validEmail) { messageBox.textContent = '請輸入有效的電子郵件'; return }
  if (!validPassword) { messageBox.textContent = '密碼需至少6位，可純英/純數/英數混合'; return }
  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
    const res = await signInWithEmailAndPassword(auth, email, password)
    messageBox.textContent = '登入成功'
    window.location.href = './home.html'
  } catch (err) {
    const map = {
      'auth/invalid-email': '電子郵件格式不正確',
      'auth/user-disabled': '帳號已停用，請聯繫管理員',
      'auth/user-not-found': '查無此帳號，請註冊或聯繫管理員',
      'auth/wrong-password': '密碼錯誤，請重新輸入',
      'auth/too-many-requests': '嘗試次數過多，請稍後再試',
      'auth/network-request-failed': '網路連線失敗，請檢查網路',
    }
    const msg = map[err?.code] || ('登入失敗：' + (err?.code || '未知錯誤'))
    messageBox.textContent = msg
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
