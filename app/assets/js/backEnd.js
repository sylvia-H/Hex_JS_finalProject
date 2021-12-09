// 驗證
const token_UID = "t5fZx20LStfPtkitAn2xrbhylAC2";
const api_path = "sylviah";
const validHeader = {
  headers: {
    'Authorization': `${token_UID}`
  }
}

// baseurl
const BEbaseURL = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`;

// 全域資料變數
let ordersData = [];


// 取得訂單列表
function getOrderList(){
    axios.get(BEbaseURL, validHeader)
    .then((res)=>{
        // 將取得的資料賦予全域變數
        ordersData = res.data.orders;

        // 初始渲染
        init_BE();
    })
    .catch((err)=>{
        console.log(err.message);
    });
}


// 渲染訂單列表
function renderOrderList(){
    const orderList = document.querySelector('.orderList');
    let str = "";

    ordersData.forEach(item => {
        const productItems = item.products.map(el=>el.title).join("<br>");

        str += `
        <tr>
          <th scope="row">
            ${item.id}
          </th>
          <td>
            ${item.user.name}<br>
            ${item.user.tel}
          </td>
          <td>
            ${item.user.address}
          </td>
          <td>
            ${item.user.email}
          </td>
          <td>
            ${productItems}
          </td>
          <td>
            ${item.createdAt}
          </td>
          <td>
              <p class="btn orderStatus link-info" onclick="editStatus('${item.id}',${item.paid});">
                <u>${item.paid?'已處理':'未處理'}</u>
              </p>
          </td>
          <td>
            <button type="button" class="btn btn-danger" onclick="delOrder('${item.id}');">刪除</button>
          </td>
        </tr>`;
    });

    orderList.innerHTML = str;

}


// 全產品類別營收比重：繪製 C3 圓餅圖
function printCategoryPie(){
    // 將 data 資料結構重組為 C3 要求的結構
    const categoryData = [];
    const chartSourceData = {};
    ordersData.forEach(el => {
        el.products.forEach(item => {
            if(!chartSourceData[item.category]){
                chartSourceData[item.category] = 1;
            }else{
                chartSourceData[item.category]+=1
            }
        });
    });
    
    const chartCategory = Object.keys(chartSourceData);
    chartCategory.forEach(category => categoryData.push([category, chartSourceData[category]]));
    
    //繪製圓餅圖
    const categoryRevenueChart = c3.generate({
      bindto: '#categoryRevenueChart',
      data: {
        columns: categoryData,
        type : 'pie',
        colors: {
        "窗簾": '#F3A712',
        "床架": '#534D41',
        "收納": '#F0CEA0'
        }
      },
      legend: {
        show: true //是否顯示項目
      }
    });

}


// 全品項營收比重：繪製 C3 圓餅圖
function printItemsPie(){
  // 將 data 資料結構重組為 C3 要求的結構
  const itemsData = [];
  const chartSourceData = {};
  ordersData.forEach(el => {
      el.products.forEach(item => {
          if(!chartSourceData[item.title]){
              chartSourceData[item.title] = 1;
          }else{
              chartSourceData[item.title]+=1
          }
      });
  });
  
  const chartItems = Object.keys(chartSourceData);
  chartItems.forEach(item => itemsData.push([item, chartSourceData[item]]));

  // 各品項的數量比大小，選出前三項，剩下的列為其他
  let compareData = itemsData.sort((item1, item2) => {
    return item2[1] - item1[1]
  });
  let arr1 = compareData.slice(0,3);
  let arr2 = compareData.slice(3, compareData.length);
  let othersNum = 0;
  arr2.forEach(el => othersNum += el[1]);
  let newData = arr1.concat([["其他", othersNum]]);
  
  //繪製圓餅圖
  const itemsRevenueChart = c3.generate({
    bindto: '#itemsRevenueChart',
    data: {
      columns: newData,
      type : 'pie',
      colors: {
        "Antony 遮光窗簾": '#6B6054',
        "Charles 雙人床架": '#546A76',
        "Antony 床邊桌": '#88A0A8',
        "Louvre 單人床架": '#929487',
        "Louvre 雙人床架／雙人加大": '#B4CEB3',
        "Antony 雙人床架／雙人加大": '#A85751',
        "Jordan 雙人床架／雙人加大": '#C4F5FC',
        "Charles 系列儲物組合": '#D57A66',
        "其他": '#EFDD8D'
      }
    },
    legend: {
      show: true //是否顯示項目
    }
  });

}


// 修改訂單已處理/未處理狀態
function editStatus(id, status){

  // 本來想用三元運算來代入 status
  // 使程式碼簡潔地結束
  // status?false:true;
  // 但不知為何用樣板字面值會導致型別錯誤，以致最後重複了兩次類似的 code

  if(status){
    axios.put(BEbaseURL,{
      "data": {
        "id": `${id}`,
        "paid": false
      }
    },validHeader)
    .then((res)=>{
        console.log(res.data.orders);
        ordersData = res.data.orders;
        // 重新渲染畫面
        renderOrderList(ordersData);
    })
    .catch((err)=>{
        console.log(err.message);
    });
  } else {
    axios.put(BEbaseURL,{
      "data": {
        "id": `${id}`,
        "paid": true
      }
    },validHeader)
    .then((res)=>{
        console.log(res.data.orders);
        ordersData = res.data.orders;
        // 重新渲染畫面
        renderOrderList(ordersData);
    })
    .catch((err)=>{
        console.log(err.message);
    });
  }
  
}


// 刪除特定單筆訂單
function delOrder(id){
  const endpoint = `${BEbaseURL}/${id}`

  // 使用 sweetalert 進行確認
  swal({
    title:"確定刪除此筆訂單嗎？",
    text: "按下確定後資料會永久刪除",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      //使用者按下「確定」後執行刪除資料
      axios.delete(endpoint,validHeader)
      .then((res)=>{
          console.log(res.data.orders);
          ordersData = res.data.orders;
          // 重新渲染畫面
          init_BE();
      })
      .catch((err)=>{
          console.log(err.message);
      });
      //刪除資料後跳出成功刪除視窗
      swal("刪除完成!", "此筆訂單已刪除", {
        icon: "success",
      });
    } else {
      //使用者按下「取消」跳出視窗
      swal("訂單未被刪除");
    }
  });
}


// 清除所有訂單
function clearAllOrders(){
  // 使用 sweetalert 進行確認
  swal({
    title:"確定刪除全部訂單嗎？",
    text: "按下確定後資料會永久刪除",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      //使用者按下「確定」後執行刪除資料
      axios.delete(BEbaseURL,validHeader)
      .then((res)=>{
          console.log(res.data.orders);
          ordersData = res.data.orders;
          // 重新渲染畫面
          init_BE();
      })
      .catch((err)=>{
          console.log(err.message);
      });
      //刪除資料後跳出成功刪除視窗
      swal("刪除完成!", "訂單已經全部刪除", {
        icon: "success",
      });
    } else {
      //使用者按下「取消」跳出視窗
      swal("訂單未被刪除");
    }
  });
}


// 後台：重新渲染畫面
function init_BE(){
  renderOrderList();
  printCategoryPie();
  printItemsPie();
}
