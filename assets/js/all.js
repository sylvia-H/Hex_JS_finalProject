"use strict";
"use strict";

// 驗證
var token_UID = "t5fZx20LStfPtkitAn2xrbhylAC2";
var api_path = "sylviah";
var validHeader = {
  headers: {
    'Authorization': "".concat(token_UID)
  }
}; // baseurl

var BEbaseURL = "https://livejs-api.hexschool.io/api/livejs/v1/admin/".concat(api_path, "/orders"); // 全域資料變數

var ordersData = []; // 取得訂單列表

function getOrderList() {
  axios.get(BEbaseURL, validHeader).then(function (res) {
    // 將取得的資料賦予全域變數
    ordersData = res.data.orders; // 初始渲染

    init_BE();
  })["catch"](function (err) {
    console.log(err.message);
  });
} // 渲染訂單列表


function renderOrderList() {
  var orderList = document.querySelector('.orderList');
  var str = "";
  ordersData.forEach(function (item) {
    var productItems = item.products.map(function (el) {
      return el.title;
    }).join("<br>");
    str += "\n        <tr>\n          <th scope=\"row\">\n            ".concat(item.id, "\n          </th>\n          <td>\n            ").concat(item.user.name, "<br>\n            ").concat(item.user.tel, "\n          </td>\n          <td>\n            ").concat(item.user.address, "\n          </td>\n          <td>\n            ").concat(item.user.email, "\n          </td>\n          <td>\n            ").concat(productItems, "\n          </td>\n          <td>\n            ").concat(item.createdAt, "\n          </td>\n          <td>\n              <p class=\"btn orderStatus link-info\" onclick=\"editStatus('").concat(item.id, "',").concat(item.paid, ");\">\n                <u>").concat(item.paid ? '已處理' : '未處理', "</u>\n              </p>\n          </td>\n          <td>\n            <button type=\"button\" class=\"btn btn-danger\" onclick=\"delOrder('").concat(item.id, "');\">\u522A\u9664</button>\n          </td>\n        </tr>");
  });
  orderList.innerHTML = str;
} // 全產品類別營收比重：繪製 C3 圓餅圖


function printCategoryPie() {
  // 將 data 資料結構重組為 C3 要求的結構
  var categoryData = [];
  var chartSourceData = {};
  ordersData.forEach(function (el) {
    el.products.forEach(function (item) {
      if (!chartSourceData[item.category]) {
        chartSourceData[item.category] = 1;
      } else {
        chartSourceData[item.category] += 1;
      }
    });
  });
  var chartCategory = Object.keys(chartSourceData);
  chartCategory.forEach(function (category) {
    return categoryData.push([category, chartSourceData[category]]);
  }); //繪製圓餅圖

  var categoryRevenueChart = c3.generate({
    bindto: '#categoryRevenueChart',
    data: {
      columns: categoryData,
      type: 'pie',
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
} // 全品項營收比重：繪製 C3 圓餅圖


function printItemsPie() {
  // 將 data 資料結構重組為 C3 要求的結構
  var itemsData = [];
  var chartSourceData = {};
  ordersData.forEach(function (el) {
    el.products.forEach(function (item) {
      if (!chartSourceData[item.title]) {
        chartSourceData[item.title] = 1;
      } else {
        chartSourceData[item.title] += 1;
      }
    });
  });
  var chartItems = Object.keys(chartSourceData);
  chartItems.forEach(function (item) {
    return itemsData.push([item, chartSourceData[item]]);
  }); // 各品項的數量比大小，選出前三項，剩下的列為其他

  var compareData = itemsData.sort(function (item1, item2) {
    return item2[1] - item1[1];
  });
  var arr1 = compareData.slice(0, 3);
  var arr2 = compareData.slice(3, compareData.length);
  var othersNum = 0;
  arr2.forEach(function (el) {
    return othersNum += el[1];
  });
  var newData = arr1.concat([["其他", othersNum]]); //繪製圓餅圖

  var itemsRevenueChart = c3.generate({
    bindto: '#itemsRevenueChart',
    data: {
      columns: newData,
      type: 'pie',
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
} // 修改訂單已處理/未處理狀態


function editStatus(id, status) {
  // 本來想用三元運算來代入 status
  // 使程式碼簡潔地結束
  // status?false:true;
  // 但不知為何用樣板字面值會導致型別錯誤，以致最後重複了兩次類似的 code
  if (status) {
    axios.put(BEbaseURL, {
      "data": {
        "id": "".concat(id),
        "paid": false
      }
    }, validHeader).then(function (res) {
      console.log(res.data.orders);
      ordersData = res.data.orders; // 重新渲染畫面

      renderOrderList(ordersData);
    })["catch"](function (err) {
      console.log(err.message);
    });
  } else {
    axios.put(BEbaseURL, {
      "data": {
        "id": "".concat(id),
        "paid": true
      }
    }, validHeader).then(function (res) {
      console.log(res.data.orders);
      ordersData = res.data.orders; // 重新渲染畫面

      renderOrderList(ordersData);
    })["catch"](function (err) {
      console.log(err.message);
    });
  }
} // 刪除特定單筆訂單


function delOrder(id) {
  var endpoint = "".concat(BEbaseURL, "/").concat(id); // 使用 sweetalert 進行確認

  swal({
    title: "確定刪除此筆訂單嗎？",
    text: "按下確定後資料會永久刪除",
    icon: "warning",
    buttons: true,
    dangerMode: true
  }).then(function (willDelete) {
    if (willDelete) {
      //使用者按下「確定」後執行刪除資料
      axios["delete"](endpoint, validHeader).then(function (res) {
        console.log(res.data.orders);
        ordersData = res.data.orders; // 重新渲染畫面

        init_BE();
      })["catch"](function (err) {
        console.log(err.message);
      }); //刪除資料後跳出成功刪除視窗

      swal("刪除完成!", "此筆訂單已刪除", {
        icon: "success"
      });
    } else {
      //使用者按下「取消」跳出視窗
      swal("訂單未被刪除");
    }
  });
} // 清除所有訂單


function clearAllOrders() {
  // 使用 sweetalert 進行確認
  swal({
    title: "確定刪除全部訂單嗎？",
    text: "按下確定後資料會永久刪除",
    icon: "warning",
    buttons: true,
    dangerMode: true
  }).then(function (willDelete) {
    if (willDelete) {
      //使用者按下「確定」後執行刪除資料
      axios["delete"](BEbaseURL, validHeader).then(function (res) {
        console.log(res.data.orders);
        ordersData = res.data.orders; // 重新渲染畫面

        init_BE();
      })["catch"](function (err) {
        console.log(err.message);
      }); //刪除資料後跳出成功刪除視窗

      swal("刪除完成!", "訂單已經全部刪除", {
        icon: "success"
      });
    } else {
      //使用者按下「取消」跳出視窗
      swal("訂單未被刪除");
    }
  });
} // 後台：重新渲染畫面


function init_BE() {
  renderOrderList();
  printCategoryPie();
  printItemsPie();
}
"use strict";

// 驗證
var token_UID = "t5fZx20LStfPtkitAn2xrbhylAC2";
var api_path = "sylviah"; // baseurl

var FEbaseURL = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path); // 全域資料變數

var productsData = [];
var cartData = []; // 取得產品列表

function getProducts() {
  var endpoint = "".concat(FEbaseURL, "/products");
  axios.get(endpoint).then(function (res) {
    // 將取得的資料賦予全域變數
    productsData = res.data.products; // 初始渲染

    renderProducts(productsData);
    renderFilter();
  })["catch"](function (err) {
    console.log(err);
  });
} // 渲染產品列表 & 產品篩選器


function renderProducts(data) {
  var str = "";
  data.forEach(function (item) {
    str += "\n        <div data-category=\"".concat(item.category, "\" class=\"col-6 col-md-4 col-lg-3 mb-7\">\n          <div class=\"card rounded-0 mb-2\">\n            <div class=\"productImg\" data-text=\"").concat(item.description, "\">\n              <img class=\"w-100 h-100 img-cover\" src=\"").concat(item.images, "\" alt=\"").concat(item.title, "\">\n            </div>\n            <span class=\"bg-black text-white py-2 px-6\">\u65B0\u54C1</span>\n            <div data-id=\"").concat(item.id, "\" class=\"btn_intoCart btn rounded-0 bg-black py-3\">\n              <p class=\"fz-5 text-white\">\u653E\u5165\u8CFC\u7269\u8ECA</p>\n            </div>\n          </div>\n          <div class=\"text-start\">\n            <p class=\"product_name fz-5 mb-2\">\n                ").concat(item.title, "\n            </p>\n            <p class=\"product_oriPrice text-decoration-line-through\">\n                ").concat(item.origin_price, "\n            </p>\n            <p class=\"product_Price fz-6\">\n                ").concat(item.price, "\n            </p>\n          </div>\n        </div>");
  });
  var productsList = document.querySelector('.productsList');
  productsList.innerHTML = str; // 取得所有"加入購物車"按鈕

  catchCartBtn();
} // 渲染產品篩選器 productsCategory 裡面的選項


function renderFilter() {
  var options = new Set();
  productsData.forEach(function (item) {
    options.add(item.category);
  });
  var productsCategory = document.querySelector('.productsCategory');
  var optionStr = "<option selected>全部</option>";
  Array.from(options).forEach(function (item) {
    optionStr += "<option value=\"".concat(item, "\">").concat(item, "</option>");
  });
  productsCategory.innerHTML = optionStr;
} // 取得"加入購物車"按鈕 & 設置監聽


function catchCartBtn() {
  var btn_intoCart = Array.from(document.querySelectorAll('.btn_intoCart'));
  btn_intoCart.forEach(function (item) {
    item.addEventListener('click', function () {
      addCart(item.dataset.id);
    });
  });
} // 放入購物車


function addCart(id) {
  var endpoint = "".concat(FEbaseURL, "/carts"); // 預設放入 1 件商品

  var itemNum = 1; // 確認購物車中是否已有相同品項

  if (cartData.carts.length) {
    var hasItem = [];
    hasItem = cartData.carts.filter(function (item) {
      return item.product.id == id;
    });

    if (hasItem.length) {
      itemNum = hasItem[0].quantity + 1;
    }
  }

  axios.post(endpoint, {
    "data": {
      "productId": "".concat(id),
      "quantity": itemNum
    }
  }).then(function (res) {
    renderCart();
  })["catch"](function (err) {
    console.log(err);
  });
} // 渲染購物車列表


function renderCart() {
  var endpoint = "".concat(FEbaseURL, "/carts");
  axios.get(endpoint).then(function (res) {
    // 將取得的資料賦予全域變數
    cartData = res.data;
    var cartList = document.querySelector('.cartList');
    var str = "";
    cartData.carts.forEach(function (item) {
      str += "\n            <tr>\n              <th class=\"d-flex ai-c\" scope=\"row\">\n                <div class=\"cartImg me-4\">\n                    <img class=\"w-100 h-100 img-cover\" src=\"".concat(item.product.images, "\" alt=\"cart-product\">\n                </div>\n                <p>").concat(item.product.title, "</p>\n              </th>\n              <td>\n                ").concat(item.product.origin_price, "\n              </td>\n              <td>\n                <input data-id=\"").concat(item.id, "\" class=\"cartItem_quantity form-control\" type=\"number\" value=\"").concat(item.quantity, "\">\n              </td>\n              <td>\n                ").concat(item.product.price, "\n              </td>\n              <td>\n                <span data-id=\"").concat(item.id, "\" class=\"deleteCartItem material-icons fw-bold\">\n                  clear\n                </span>\n              </td>\n            </tr>");
    }); // 將最終金額加上千分位符號

    var totalPrice = toTenPercentile(cartData.finalTotal); // 最後一列加上總金額

    str += "\n        <tr class=\"border-light\">\n            <th scope=\"row\">\n            <div id=\"btn_deleteAll\" class=\"btn btn-light fw-bold my-4\">\n                \u522A\u9664\u6240\u6709\u54C1\u9805\n            </div>\n            </th>\n            <td>\n            </td>\n            <td class=\"fw-bold\">\n            \u7E3D\u91D1\u984D\n            </td>\n            <td colspan=\"2\" class=\"fz-5 fz-md-6\">\n            NT$".concat(totalPrice, "\n            </td>\n        </tr>");
    cartList.innerHTML = str; // 加上修改品項數量功能

    editQuantity(); // 加上刪除特定品項功能

    deleteCartItem(); // 加上刪除所有品項功能

    deleteAll();
  })["catch"](function (err) {
    console.log(err);
  });
} // 轉換千分位符號


function toTenPercentile(num) {
  var parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
} // 修改特定品項數量


function editQuantity() {
  var cartItem_quantity = Array.from(document.querySelectorAll('.cartItem_quantity'));
  cartItem_quantity.forEach(function (el) {
    el.addEventListener('change', function () {
      var id = el.dataset.id;
      var num = parseInt(el.value);
      console.log(num);

      if (num <= 0) {
        alert('如果不想要這件商品，請直接按刪除喔，謝謝您！');
        return;
      }

      var endpoint = "".concat(FEbaseURL, "/carts");
      axios.patch(endpoint, {
        "data": {
          "id": id,
          "quantity": num
        }
      }).then(function (res) {
        console.log(res);
        renderCart();
      })["catch"](function (err) {
        console.log(err);
      });
    });
  });
} // 刪除購物車特定品項


function deleteCartItem() {
  var deleteCartItem = Array.from(document.querySelectorAll('.deleteCartItem'));
  deleteCartItem.forEach(function (item) {
    item.addEventListener('click', function () {
      var endpoint = "".concat(FEbaseURL, "/carts/").concat(item.dataset.id);
      axios["delete"](endpoint).then(function (res) {
        renderCart();
      })["catch"](function (err) {
        console.log(err);
      });
    });
  });
} // 刪除購物車所有品項


function deleteAll() {
  var btn_deleteAll = document.getElementById('btn_deleteAll');
  btn_deleteAll.addEventListener('click', function () {
    var endpoint = "".concat(FEbaseURL, "/carts");
    axios["delete"](endpoint).then(function (res) {
      console.log(res);
      renderCart();
    })["catch"](function (err) {
      console.log(err);
    });
  });
} // 表單驗證：約束條件設定


var constraints = {
  fname: {
    presence: {
      message: "/必填！"
    }
  },
  fphone: {
    presence: {
      message: "/必填！"
    },
    format: {
      pattern: "[0-9]+",
      message: "/請填入正確的電話或手機號碼格式。"
    },
    length: {
      // 最少 9 碼
      minimum: 9,
      message: "/電話號碼的長度不太對喔！市內電話請加上區域號碼。"
    }
  },
  femail: {
    presence: {
      message: "/必填！"
    },
    email: {
      message: "/請填入正確的 email 格式。"
    }
  },
  faddress: {
    presence: {
      message: "/必填！"
    }
  }
}; // 送出訂單

function sendOrder() {
  var sendReserveForm = document.getElementById('sendOrder');
  var reserveForm = document.querySelector('.reserveForm');
  var reserveFormInputs = Array.from(document.querySelectorAll('.reserveForm input, .reserveForm select')); // 監聽：送出訂單按鈕

  sendReserveForm.addEventListener('click', function (e) {
    // 表單驗證
    var errors = validate(reserveForm, constraints);

    if (errors) {
      console.log(errors);
      Object.keys(errors).forEach(function (key) {
        var targetElement = document.getElementById(key);
        var msg = errors[key][0].split('/')[1];
        targetElement.innerHTML = msg;
      });
      return;
    } // 若購物車是空的，不送出訂單


    if (cartData.carts.length === 0) {
      alert('再多逛一下，把喜歡的品項放進購物車喔！');
      return;
    } // 防呆


    e.target.setAttribute("disabled", ""); // 驗證通過，送出訂單

    var endpoint = "".concat(FEbaseURL, "/orders");
    axios.post(endpoint, {
      "data": {
        "user": {
          "name": reserveFormInputs[0].value,
          "tel": reserveFormInputs[1].value,
          "email": reserveFormInputs[2].value,
          "address": reserveFormInputs[3].value,
          "payment": reserveFormInputs[4].value
        }
      }
    }).then(function (res) {
      console.log(res); // 成功送出訂單，sweetalert 跳出成功訊息

      swal({
        title: "成功！",
        text: "已收到您的訂單，請耐心等候到貨。",
        icon: "success",
        button: "OK"
      }); // 清空表單資料 & 重新渲染購物車列表

      reserveFormInputs.forEach(function (item) {
        return item.value = '';
      });
      renderCart(); // 防呆解除

      e.target.removeAttribute("disabled");
    })["catch"](function (err) {
      console.log(err);
    });
  });
} // 前台：初始渲染


function init_FE() {
  // 取得產品列表
  getProducts(); // 渲染購物車列表

  renderCart(); // 監聽送出訂單資料按鈕

  sendOrder(); // 監聽產品篩選器：過濾產品列表

  var productsCategory = document.querySelector('.productsCategory');
  productsCategory.addEventListener('change', function (e) {
    if (e.target.value === '全部') {
      renderProducts(productsData);
      return;
    }

    var data = productsData.filter(function (item) {
      return item.category === e.target.value;
    });
    renderProducts(data);
  });
}
"use strict";

// 首頁 - 好評推薦-上層
var recommendTopSwiper = new Swiper('.recommendTopSwiper', {
  slidesPerView: 2.57,
  spaceBetween: 30
}); // 首頁 - 好評推薦-下層

var recommendBottomSwiper = new Swiper('.recommendBottomSwiper', {
  slidesPerView: 2.8,
  spaceBetween: 30
});
//# sourceMappingURL=all.js.map
