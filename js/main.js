

// display with space in 3nums
async function handleInput(e, id, func) {
  let vI = e.target.value;
  vI = vI.replace(/,/g, '.'); // some use , to .
  vI = vI.replace(/ /g, ''); // erase space
  vI = INT(vI, 10); // precision 10
  e.target.value = SPACE(vI);
  
  let ot = select(id);
  if (vI == 0) {
    ot.value = 0;
    return;
  }
  
  let bvI = BIG(vI);
  let bvO = await func(bvI);
  let vO = ETH(BIGINT(bvO));
  
  vO = INT(vO, 10);
  ot.value = SPACE(vO);
}

// input output display, switch, buy
async function handleInputSwap(e, id, rI, rO) {
  await handleInput(e, id, async (v) => {
    return await v * rO / rI;
  });
}



let STATES = {};
async function swapSwitch() {
  let names = [select(`#swap-input-name`).innerHTML, select(`#swap-output-name`).innerHTML];
  let values = [select(`#swap-input-value`).value, select(`#swap-output-value`).value];
  let r = [100, 10];

  names = SWAP(names);
  values = SWAP(values);
  r = SWAP(r);

  displayText(`#swap-input-name`, names[0]);
  displayText(`#swap-output-name`, names[1]);

  select(`#swap-input-value`).value = values[0];
  select(`#swap-output-value`).value = values[1];

  select(`#swap-input-value`).removeEventListener('input', async (v) => {
    await handleInputSwap(v, '#swap-output-value', r[1], r[0]);
  });
  select(`#swap-input-value`).addEventListener('input', async (v) => {
    await handleInputSwap(v, '#swap-output-value', r[0], r[1]);
  });


  STATES['swap'] = TOGGLE(STATES['swap']);
}

displayText('#swap-input-name', 'wDOGE');
displayText('#swap-output-name', 'USDC');
STATES['swap'] = true;
(async () => {
	await swapSwitch();
})();

async function swapRun() {
  return 0;
}


select(`#swap-switch`).onclick = async () => { await swapSwitch(); };
select(`#swap-run`).onclick = async () => { await swapRun(); };

console.log('main done');