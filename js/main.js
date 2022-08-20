

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
  let names = ['wDOGE', 'USDC'];
  let values = [select(`#swap-input-value`).value, select(`#swap-output-value`).value];
  let r = [100, 10];
  if (STATES['swap']) {
    names = [names[1], names[0]];
    values = [values[1], values[0]];
    r = [r[1], r[0]];
  }

  displayText(`#swap-input-name`, names[0]);
  displayText(`#swap-output-name`, names[1]);

  displayText(`#swap-input-value`, values[0]);
  displayText(`#swap-output-value`, values[1]);

  select(`#swap-input-value`).removeEventListener('input', async (v) => {
    await handleInputSwap(v, '#swap-output-value', r[1], r[0]);
  });
  select(`#swap-input-value`).removeEventListener('input', async (v) => {
    await handleInputSwap(v, '#swap-output-value', r[0], r[1]);
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