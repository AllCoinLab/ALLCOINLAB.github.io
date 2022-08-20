

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
    return await v.mul(rO).div(rI);
  });
}
