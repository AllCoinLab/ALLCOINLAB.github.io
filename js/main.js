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
  
  let vO = await func(vI);
  vO = INT(vO, 5);
  
  ot.value = SPACE(vO);
}

async function _setSwapRate(names, vs) {
  let msg = ``;
  msg += `1 ${names[0]} = ${ROUND(vs[1] / vs[0], 5)} ${names[1]}`;
  select('#swap-rate').innerHTML = msg;
}
async function setSwapRate(vs) {
  _setSwapRate([select(`#swap-input-name`).innerHTML, select(`#swap-output-name`).innerHTML], vs);
}

async function clearEvent(elm) {
  let elm_ = elm.cloneNode(true);
  elm.parentNode.replaceChild(elm_, elm);
}

async function setFuncs() {
  await setSwapRate([RESERVES['input'], RESERVES['output']]);
  
  await checkApprove();  

  clearEvent(select(`#swap-input-value`));
  select(`#swap-input-value`).addEventListener('input', async (e) => {
    await handleInput(e, '#swap-output-value', async (vI) => {
      let decimals = await CONTS[`${CURCHAIN}-input`].decimals();
      let args = [BIGINT(vI * 10**decimals), [CURTOKENS['input'], CURTOKENS['output']]];
      let amounts = await CONTS[`${CURCHAIN}-${CURDEX}-router`].getAmountsOut(...args);
      let decimals_ = await CONTS[`${CURCHAIN}-output`].decimals();
      let vO = amounts[1] / 10**decimals_;
      await setSwapRate([vI, vO]);

      return vO;
    });
  });
}

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
  
  if (CURADR) {
    BALS = {
      'input': BALS['output'], 
      'output': BALS['input'],
    };

    // display method?
    for (let target of ['input', 'output']) {
      displayText(`#${target}-balance`, ROUND(BALS[target], 3));
    }
  }

  await setFuncs();
}


async function getPair(tI, tO) {
  let pair = await CONTS[`dog-${CURDEX}-factory`].getPair(tI, tO);
  if (pair == "0x0000000000000000000000000000000000000000") {
    return [true, [pair]];
  }

  // balance?
  return [false, [pair]];
}

async function getR(pair) {
  setConts(`t`, pair, ABIS['pair']);
  let r = await CONTS[`t`].getReserves();
  if (CURTOKENS['input'] > CURTOKENS['output']) {
    r = [r[1], r[0]];
  }
  return [r[0] / 1, r[1] / 1];
}

// pair based, token based
async function setPair() {
  let [res, data] = await getPair(CURTOKENS['input'], CURTOKENS['output']);
  if (res) {
    displayText('#swap-rate', 'no pair');
    return [true, data];
  }
  let pair = data[0];

  let r = await getR(pair);
  RESERVES = {
    'input': r[0],
    'output': r[1],
  };

  select('#dexscreen').src = `https://dexscreener.com/dogechain/${pair}?embed=1&amp;theme=dark&amp;info=0`;

  for (let target of ['input', 'output']) {
    setConts(`${CURCHAIN}-${target}`, CURTOKENS[target], ABIS['token']);
    // let name = await CONTS[`${CURCHAIN}-${target}`].name();
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
    'yod': 'YodeSwap',
    'qui': 'QuickSwap',
    'kib': 'KibbleSwap',
  }
}
let CURDEX = 'max';

let CURTOKENS = {
  'input': ADRS['dog-usdt'],
  'output': ADRS['dog-usdc'],
};

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
    aI = BIGINT(FLOAT(aI) * 10**decimals);
  }
  let aO = select(`#swap-output-value`).value.replace(/ /g, '');
  {
    let decimals = await CONTS[`${CURCHAIN}-output`].decimals();
    aO = BIGINT(FLOAT(aO) * 10**decimals);
  }

  if (!CURADR) {
    alert('connect wallet');
    return;
  }
  
  let args = [ADRS[`dog-${CURDEX}-factory`], aI, BIGINT(aO * 97n / 100n), [CURTOKENS['input'], CURTOKENS['output']], CURADR, NOW() + 1000];
  l(args);
  await SEND_TX(`dog-max-route`, 'swapExactTokensForTokensSupportingFeeOnTransferTokens', args);
}



async function selectDex(name) {
  displayText('#dex-type', DEX_NAMES['dog'][name]);
  CURDEX = name;

  await setPair();
}



let CURSETTARGET = 'input';
async function openSelectToken(target) {
  CURSETTARGET = target;
  select('#input-token-info').value = '';
  displayText('#token-info', `no address set`);
}


async function checkToken(adr) {
  async function invalid(s) {
    displayText('#token-info', s);
    clickable('#token-info-set', false);
    select('#token-info-set').innerHTML = 'Invalid';
  }
  
  try {
    adr = ADR(adr, false);
  } catch (e) {
    await invalid(`invalid address`);
    return;
  }
  setConts(`${CURCHAIN}-temp`, adr, ABIS['token']);

  let name;
  try {
    name = await CONTS[`${CURCHAIN}-temp`].name();
  } catch (e) {
    await invalid(`invalid address`);
    return;
  }

  let symbol = await CONTS[`${CURCHAIN}-temp`].symbol();
  displayText('#token-info', `${name} (${symbol})`);

  {
    let adrs;
    if (CURSETTARGET == 'input') {
      adrs = [adr, CURTOKENS['output']];
    } else {
      adrs = [CURTOKENS['input'], adr];
    }
    let [res, data] = await getPair(adrs[0], adrs[1]);
    if (res) {
      await invalid(`${name} (${symbol}) [NO PAIR]`);
      return;
    }
  }

  clickable('#token-info-set', true);
  select('#token-info-set').innerHTML = 'Select';
  select('#token-info-set').onclick = async () => { 
    CURTOKENS[CURSETTARGET] = adr;
    
    await setPair();
  };
}

select('#input-token-info').addEventListener('input', async (e) => { //////////////////////////////// check other dex in background
  await checkToken(e.target.value);
});


async function checkAllowance(adr) {
  if (!CURADR) {
    return true;
  }

  setConts(`${CURCHAIN}-temp`, adr, ABIS['token']);
  let allowance = await CONTS[`${CURCHAIN}-temp`].allowance(CURADR, ADRS[`dog-max-route`]);
  if (0 < allowance) {
    return false;
  }

  return true;
}

async function clickable(id, b) {
  if (b) {
    // select(id).classList.remove('pe-none'); // not working
    select(id).style.pointerEvents = 'auto';
    select(id).classList.add('btn-primary');
  } else {
    // select(id).classList.add('pe-none');
    select(id).style.pointerEvents = 'none';
    select(id).classList.remove('btn-primary')
  }
}
async function checkApprove() {
  let allowance = await checkAllowance(CURTOKENS['input']);
  if (allowance) {
    clickable('#swap-approve', true);
    select('#swap-approve').innerHTML = 'Approve';
    clickable('#swap-run', false);
    displayText('#swap-run', 'Approve First');
  } else {
    clickable('#swap-approve', false);
    select('#swap-approve').innerHTML = 'Approved';
    clickable('#swap-run', true);
    displayText('#swap-run', 'Swap');
  }
}

let useEth = false;
async function setToken(name) {
  let adr;
  if (name == 'wdoge') {
    useEth = true;
    adr = ADRS[`${CURCHAIN}-weth`];
  } else {
    adr = ADRS[`${CURCHAIN}-${name}`];
  }
  await checkToken(adr);
}

async function runGlobal() {
  await setPair();
  
  select('#conn').onclick = async () => { await conn(); };
  select(`#swap-switch`).onclick = async () => { await swapSwitch(); };
  select(`#swap-run`).onclick = async () => { await swapRun(); };
  select(`#swap-tx`).onclick = async () => { await swapTx(); };
  select(`#swap-approve`).onclick = async () => {
    let [res, data] = await SEND_TX(`${CURCHAIN}-input`, 'approve', [ADRS[`dog-max-route`], UINT256MAX]);
    let result = await data.wait();
    if (result.status == 1) {
      await checkApprove();
    }
  };
  
  for (name of ['wdoge', 'weth', 'usdc', 'usdt']) {
    select(`#select-${name}`).onclick = async (e) => { await setToken(e.target.id.split('-')[1]); };
  }
}

async function runAnon() {
  clickable('#conn', true);
  select('#conn').innerHTML = "Connect Wallet";
}

let BALS = {
  'input': 0,
  'output': 0,
};
async function runPersonal() {
  clickable('#conn', false);
  select('#conn').innerHTML = SHORTADR(CURADR);

  await checkApprove();

  for (let target of ['input', 'output']) {
    let bal = await CONTS[`${CURCHAIN}-${target}`].balanceOf(CURADR);
    let decimals = await CONTS[`${CURCHAIN}-${target}`].decimals();
    BALS[target] = bal / 10**decimals;

    displayText(`#${target}-balance`, ROUND(BALS[target], 3));
  }
}

(async () => {
  await runGlobal();

  await getCurAdr();
  if (CURADR) {
    await runPersonal();
  } else {
    await runAnon();
  }

  $('[data-bs-toggle="tooltip"]').tooltip();
})();


console.log('main done');
