const epoch = document.querySelector('.menu-list li ul li a.is-active span').textContent.trim();
[...document.querySelectorAll('.infoBox')].map(el => ({
  name: el.querySelector('.type h2').textContent,
  epoch,
  effect: el.querySelector('.stats .effect')?.textContent,
  cost: el.querySelector('.stats .cost')?.textContent,
  extra: el.querySelector('.extra').textContent,
  ...[...el.querySelectorAll('.reqs')].reduce((acc, el) => {
    const [titleEl, ...itemEls] = el.children;
    const key = titleEl.textContent.includes('需要前置研究') ? 'prerequisites' : 'specialPrerequisites';
    acc[key] = itemEls.map(el => el.textContent);
    return acc;
  }, {})
}))
