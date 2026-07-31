function clearData() {
  localStorage.removeItem('blog_articles')
  document.getElementById('success').classList.add('show')
  setTimeout(() => {
    window.location.href = 'http://localhost:3001/category/学习记录'
  }, 1500)
}
