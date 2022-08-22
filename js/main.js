

// display with space in 3nums
async function handleInput(e, id, func) {
  let vI = e.target.value;
  vI = vI.replace(/,/g, '.'); // some use , to .
  vI = vI.replace(/ /g, ''); // erase space
  if (vI == '') {
    vI = 0;
  }
  e.target.value = SPACE(vI);
  vI = INT(vI, 5); // precision 5
  
  let ot = select(id);
  if (vI == 0) {
    ot.value = 0;
    return;
  }
  
  let bvI = BIG(vI);
  let bvO = await func(bvI);
  let vO = ETH(BIGINT(bvO));
  
  console.log(bvI, bvO, vO);
  vO = INT(vO, 5);
  
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
  
  names = SWAP(names);
  values = SWAP(values);
  r = SWAP(r);

  displayText(`#swap-input-name`, names[0]);
  displayText(`#swap-output-name`, names[1]);

  select(`#swap-input-value`).value = values[0];
  select(`#swap-output-value`).value = values[1];

  let elm = select(`#swap-input-value`).cloneNode(true);
  select(`#swap-input-value`).parentNode.replaceChild(elm, select(`#swap-input-value`));
  select(`#swap-input-value`).addEventListener('input', async (e) => {
    await handleInputSwap(e, '#swap-output-value', r[0], r[1]);
  });

  let msg = ``;
  msg += `1 ${names[0]} = ${INT(r[1] / r[0], 4)} ${names[1]}`;
  select('#swap-rate').innerHTML = msg;

  STATES['swap'] = TOGGLE(STATES['swap']);
}

CURCHAIN = 'dog';
let CURTOKENS = {
  'input': ADRS['dog-weth'],
  'output': ADRS['dog-usdc'],
};
let r = [100, 10];
displayText('#swap-input-name', 'wDOGE');
displayText('#swap-output-name', 'USDC');
STATES['swap'] = true;
(async () => {
	await swapSwitch();
})();

async function swapRun() {
  let msg = ``;
  msg += `swap process\n`;
  msg += `from ${select(`#swap-input-value`).value} ${select(`#swap-input-name`).innerHTML}\n`;
  msg += `to ${select(`#swap-output-value`).value} ${select(`#swap-output-name`).innerHTML}\n`;
  
  displayText('#swap-msg', msg);

  return 0;
}

async function swapTx() {
  alert('swap!');
}


DEX_NAMES = {
  'dog': {
    'max': 'MaxSwap',
    'dog': 'DogeSwap',
    'yod': 'yodeSwap',
    'qui': 'QuickSwap',
  }
}

let CURDEX = 'dog';
async function selectDex(name) {
  displayText('#dex-type', DEX_NAMES['dog'][name]);
  CURDEX = name;
}



let CURSETTARGET = 'input';
async function openSelectToken(target) {
  CURSETTARGET = target;
}

select(`#swap-switch`).onclick = async () => { await swapSwitch(); };
select(`#swap-run`).onclick = async () => { await swapRun(); };
select(`#swap-tx`).onclick = async () => { await swapTx(); };

select('#input-token-info').addEventListener('input', async (e) => {
  setConts(`${CURCHAIN}-token`, e.target.value, ABIS['token']);

  try {
    let name = await CONTS[`${CURCHAIN}-token`].name();
  } catch (e) {
    displayText('#token-info', `invalid address`);
    select('#token-info-set').onclick = async () => {};
    return;
  }

  let symbol = await CONTS[`${CURCHAIN}-token`].symbol();
  displayText('#token-info', `${name} (${symbol})`);
  select('#token-info-set').onclick = async () => { 
    CURTOKENS[CURSETTARGET] = select('#input-token-info').value;
    select(`#swap-${CURSETTARGET}-name`).innerHTML = symbol;
  };
});
console.log('main done');