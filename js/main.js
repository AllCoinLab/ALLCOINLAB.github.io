'use strict'

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



async function _setSwapRate(names) {
  let msg = ``;
  msg += `1 ${names[0]} = ${ROUND(RESERVES['output'] / RESERVES['input'], 10)} ${names[1]}`;
  select('#swap-rate').innerHTML = msg;
}
async function setSwapRate() {
  _setSwapRate([select(`#swap-input-name`).innerHTML, select(`#swap-output-name`).innerHTML]);
}

async function clearEvent(elm) {
  let elm_ = elm.cloneNode(true);
  elm.parentNode.replaceChild(elm_, elm);
}

async function setFuncs() {
  clearEvent(select(`#swap-input-value`));
  select(`#swap-input-value`).addEventListener('input', async (e) => {
    await handleInputSwap(e, '#swap-output-value', RESERVES['input'], RESERVES['output']);
  });

  await setSwapRate();
}

let STATES = {};
async function swapSwitch() {
  let names = [select(`#swap-input-name`).innerHTML, select(`#swap-output-name`).innerHTML];
  [select(`#swap-input-name`).innerHTML, select(`#swap-output-name`).innerHTML] = SWAP(names);
  let values = [select(`#swap-input-value`).value, select(`#swap-output-value`).value];
  [select(`#swap-input-value`).value, select(`#swap-output-value`).value] = SWAP(values);

  RESERVES = {
    'input': RESERVES['output'], 
    'output': RESERVES['input'],
  };
  CURTOKENS = {
    'input': CURTOKENS['output'], 
    'output': CURTOKENS['input'],
  };

  await setToken();
}



async function setToken() {
  let pair = await CONTS[`dog-${CURDEX}-factory`].getPair(CURTOKENS['input'], CURTOKENS['output']);
  setConts(`${CURCHAIN}-pair`, pair, ABIS['pair']);
  let r = await CONTS[`${CURCHAIN}-pair`].getReserves();
  RESERVES = {
    'input': r[0] / 1,
    'output': r[1] / 1,
  };

  for (let target of ['input', 'output']) {
    setConts(`${CURCHAIN}-${target}`, CURTOKENS[target], ABIS['token']);
    let name = await CONTS[`${CURCHAIN}-${target}`].name();
    let symbol = await CONTS[`${CURCHAIN}-${target}`].symbol();
    let decimals = await CONTS[`${CURCHAIN}-${target}`].decimals();
    select(`#swap-${target}-name`).innerHTML = symbol;

    RESERVES[target] = RESERVES[target] / 10**decimals;
  }
  
  await setFuncs();
}

let RESERVES = {
  'input': 1,
  'output': 1,
};
let CURCHAIN = 'dog';
let DEX_NAMES = {
  'dog': {
    'max': 'MaxSwap',
    'dog': 'DogeSwap',
    'yod': 'yodeSwap',
    'qui': 'QuickSwap',
  }
}
let CURDEX = 'max';

let CURTOKENS = {
  'input': ADRS['dog-usdc'],
  'output': ADRS['dog-usdt'],
};


STATES['swap'] = true;
(async () => {
  await setToken();
	await swapSwitch();
})();

async function swapRun() {
  let aI = select(`#swap-input-value`).value.replace(/ /g, '');
  let aO = select(`#swap-output-value`).value.replace(/ /g, '');
  let msg = ``;
  msg += `swap process\n`;
  msg += `from ${aI} ${select(`#swap-input-name`).innerHTML}\n`;
  msg += `to ${aO} ${select(`#swap-output-name`).innerHTML}\n`;
  
  displayText('#swap-msg', msg);

  return 0;
}

async function swapTx() {
  let aI = select(`#swap-input-value`).value.replace(/ /g, '');
  {
    let decimals = await CONTS[`${CURCHAIN}-input`].decimals();
    aI = INT(FLOAT(aI) * 10**decimals);
  }
  let aO = select(`#swap-output-value`).value.replace(/ /g, '');
  {
    let decimals = await CONTS[`${CURCHAIN}-output`].decimals();
    aO = INT(FLOAT(aO) * 10**decimals);
  }
  let args = [aI, INT(aO * 0.97), [CURTOKENS['input'], CURTOKENS['output']], CURADR, NOW() + 1000];
  l(args);
  await SEND_TX(`dog-max-router`, 'swapExactTokensForTokensSupportingFeeOnTransferTokens', args);
}



async function selectDex(name) {
  displayText('#dex-type', DEX_NAMES['dog'][name]);
  CURDEX = name;
}



let CURSETTARGET = 'input';
async function openSelectToken(target) {
  CURSETTARGET = target;
  select('#input-token-info').value = '';
  displayText('#token-info', `no address set`);
}

select('#conn').onclick = async () => { await conn(); };
select(`#swap-switch`).onclick = async () => { await swapSwitch(); };
select(`#swap-run`).onclick = async () => { await swapRun(); };
select(`#swap-tx`).onclick = async () => { await swapTx(); };
select(`#swap-approve`).onclick = async () => { 
  setConts(`${CURCHAIN}-token`, CURTOKENS['input'], ABIS['token']);
  await SEND_TX(`${CURCHAIN}-token`, 'approve', [ADRS['dog-max-router'], UINT256MAX]);
};


select('#input-token-info').addEventListener('input', async (e) => {
  let adr;
  try {
    adr = ADR(e.target.value, false);
  } catch (e) {
    displayText('#token-info', `invalid address`);
    select('#token-info-set').onclick = async () => {
      alert('invalid address');
    };
    return;
  }
  setConts(`${CURCHAIN}-temp`, adr, ABIS['token']);

  let name;
  try {
    name = await CONTS[`${CURCHAIN}-temp`].name();
  } catch (e) {
    displayText('#token-info', `invalid address`);
    select('#token-info-set').onclick = async () => {
      alert('invalid address');
    };
    return;
  }

  let symbol = await CONTS[`${CURCHAIN}-temp`].symbol();
  displayText('#token-info', `${name} (${symbol})`);

  select('#token-info-set').onclick = async () => { 
    CURTOKENS[CURSETTARGET] = select('#input-token-info').value;
    setToken();
  };
});

(async () => {
  await getCurAdr();
  if (CURADR == null) {
    // connect wallet button
    return;
  }
})();


console.log('main done');