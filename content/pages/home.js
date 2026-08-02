// Empty as of Version 2.5 Pre Alpha 05.07.2026

// 1. Select the original element
const originalElemente = document.querySelector('.profile-info-row');

if (originalElemente) {
  // 2. Clone it with all its children
  const clonedElement = originalElemente.cloneNode(true);

  // (Optional) Remove the ID attribute to prevent duplicate IDs on the page
  clonedElement.removeAttribute('id');

  // 3. Insert the clone into the DOM (e.g., appending it to the body)
  document.body.appendChild(clonedElement);
}

const alertButton = document.querySelector('.notice')
const deleteAlrtButton = document.createElement('button');

deleteAlrtButton.className = 'vpro-nav-btn';
deleteAlrtButton.innerText = 'Dismiss Alert';
alertButton.appendChild(deleteAlrtButton);
deleteAlrtButton.addEventListener('click', function () {
  alertButton.remove();
});

const avatarTest = document.querySelector('.avatar-render-box')
avatarTest.addEventListener('click', function () {
  window.location.href = "https://playvortex.io/catalog";
});

const friendsShortcutbtn = document.querySelector('#friends-title')
friendsShortcutbtn.addEventListener('click', function () {
  window.location.href = "https://playvortex.io/social?user=&tab=friends";
});