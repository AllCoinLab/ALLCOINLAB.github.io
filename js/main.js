

// display with space in 3nums
async function handleInput(e, id, func) {
  let vI = e.target.value;
  vI = vI.replace(/,/g, '.'); // some use , to .
  vI = vI.replace(/ /g, ''); // erase space
  vI = INT(vI, 10); // precision 10
  e.target.value = ADDSPACENUM(vI);
  
  let ot = select(id);
  if (vI == 0) {
    ot.value = 0;
    return;
  }
  
  let bvI = BIG(vI);
  let bVO = await func(bvI);
  let vO = ETH(bVO);
  
  vO = INT(vO, 10);
  ot.value = vO;
}

// input output display, switch, buy
async function handleInputSwap(e, id, rI, rO) {
  await handleInput(e, id, async (v) => {
    return await v * rO / rI;
  });
}



let STATES = {};
async function swapSwitch() {
  rI = 100;
  rO = 10;
  
  let names = ['wDOGE', 'USDC'];
  if (STATES['swap']) {
    names = [names[1], names[0]];
  }

  displayText(`#swap-input-name`, names[0]);
  displayText(`#swap-output-name`, names[1]);



  select(`#swap-input-value`).removeEventListener('input', async (v) => {
    await handleInputSwap(v, '#swap-output-value', rI, rO);
  });
  select(`#swap-input-value`).addEventListener('input', async (v) => {
    await handleInputSwap(v, '#swap-output-value', rO, rI);
  });

  STATES['swap'] = TOGGLE(STATES['swap']);
}

STATES['swap'] = true;
(async () => {
	await swapSwitch();
})();
select(`#swap-switch`).onclick = async () => { await swapSwitch(); };
select(`#swap-run`).onclick = async () => { await swapRun(); };

console.log('main done');