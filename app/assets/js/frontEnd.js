// 驗證
const token_UID = "t5fZx20LStfPtkitAn2xrbhylAC2";
const api_path = "sylviah";

// baseurl
const FEbaseURL = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`;

// 全域資料變數
let productsData = [];
let cartData = [];


// 取得產品列表
function getProducts(){
    const endpoint = `${FEbaseURL}/products`;
    
    axios.get(endpoint)
    .then((res)=>{
        // 將取得的資料賦予全域變數
        productsData = res.data.products;

        // 初始渲染
        renderProducts(productsData);
        renderFilter();
    })
    .catch((err)=>{
        console.log(err);
    });
}


// 渲染產品列表 & 產品篩選器
function renderProducts(data){
    let str = "";
    data.forEach(item => {
        str += `
        <div data-category="${item.category}" class="col-6 col-md-4 col-lg-3 mb-7">
          <div class="card rounded-0 mb-2">
            <div class="productImg" data-text="${item.description}">
              <img class="w-100 h-100 img-cover" src="${item.images}" alt="${item.title}">
            </div>
            <span class="bg-black text-white py-2 px-6">新品</span>
            <div data-id="${item.id}" class="btn_intoCart btn rounded-0 bg-black py-3">
              <p class="fz-5 text-white">放入購物車</p>
            </div>
          </div>
          <div class="text-start">
            <p class="product_name fz-5 mb-2">
                ${item.title}
            </p>
            <p class="product_oriPrice text-decoration-line-through">
                ${item.origin_price}
            </p>
            <p class="product_Price fz-6">
                ${item.price}
            </p>
          </div>
        </div>`
    });

    const productsList = document.querySelector('.productsList');
    productsList.innerHTML = str;

    // 取得所有"加入購物車"按鈕
    catchCartBtn();
}


// 渲染產品篩選器 productsCategory 裡面的選項
function renderFilter(){
    let options = new Set();
    productsData.forEach(item => {
        options.add(item.category);
    });
    const productsCategory = document.querySelector('.productsCategory');
    let optionStr = "<option selected>全部</option>";
    Array.from(options).forEach(item=>{
        optionStr += `<option value="${item}">${item}</option>`;
    });
    productsCategory.innerHTML = optionStr;
}


// 取得"加入購物車"按鈕 & 設置監聽
function catchCartBtn(){
    const btn_intoCart = Array.from(document.querySelectorAll('.btn_intoCart'));
    btn_intoCart.forEach(item => {
        item.addEventListener('click',()=>{
            addCart(item.dataset.id);
        });
    });
}


// 放入購物車
function addCart(id){
    const endpoint = `${FEbaseURL}/carts`;
    let itemNum = 1;

    // 確認購物車中是否已有相同品項
    if(cartData.carts.length){
        let hasItem = cartData.carts.filter(item => item.product.id === id);
        if(hasItem){
            itemNum += 1;
        }

    }

    axios.post(endpoint, {
        "data": {
          "productId": `${id}`,
          "quantity": itemNum
        }
    })
    .then((res)=>{
        renderCart();
    })
    .catch((err)=>{
        console.log(err);
    });
}


// 渲染購物車列表
function renderCart(){
    const endpoint = `${FEbaseURL}/carts`;

    axios.get(endpoint)
    .then((res)=>{
        // 將取得的資料賦予全域變數
        cartData = res.data;
        const cartList = document.querySelector('.cartList');
        let str = "";
        cartData.carts.forEach(item => {
            str += `
            <tr>
              <th class="d-flex ai-c" scope="row">
                <div class="cartImg me-4">
                    <img class="w-100 h-100 img-cover" src="${item.product.images}" alt="cart-product">
                </div>
                <p>${item.product.title}</p>
              </th>
              <td>
                ${item.product.origin_price}
              </td>
              <td>
                <input data-id="${item.id}" class="cartItem_quantity form-control" type="number" value="${item.quantity}">
              </td>
              <td>
                ${item.product.price}
              </td>
              <td>
                <span data-id="${item.id}" class="deleteCartItem material-icons fw-bold">
                  clear
                </span>
              </td>
            </tr>`;
        });

        // 將最終金額加上千位數符號
        let totalPrice = "";
        // splice 方法不知為何失效，只好先用土法煉鋼
        // const totalPrice = data.finalTotal;
        // let num = totalPrice.toString().split('');
        // console.log(num.splice(-3, 3, ",").join(''));
        totalPrice += cartData.finalTotal.toString().slice(0,-3);
        totalPrice += ',';
        totalPrice += cartData.finalTotal.toString().slice(-3);

        // 最後一列加上總金額
        str += `
        <tr class="border-light">
            <th scope="row">
            <div id="btn_deleteAll" class="btn btn-light fw-bold my-4">
                刪除所有品項
            </div>
            </th>
            <td>
            </td>
            <td>
            </td>
            <td class="fw-bold">
            總金額
            </td>
            <td class="fz-6">
            NT$${totalPrice}
            </td>
        </tr>`;

        cartList.innerHTML = str;

        // 加上修改品項數量功能
        editQuantity();

        // 加上刪除特定品項功能
        deleteCartItem();

        // 加上刪除所有品項功能
        deleteAll();
    })
    .catch((err)=>{
        console.log(err);
    });
}


// 修改特定品項數量
function editQuantity(){
    const cartItem_quantity = Array.from(document.querySelectorAll('.cartItem_quantity'));
    cartItem_quantity.forEach(el => {
        el.addEventListener('change',() => {
            const id = el.dataset.id;
            const num = parseInt(el.value);
            console.log(num);

            if(num<=0){
                alert('如果不想要這件商品，請直接按刪除喔，謝謝您！');
                return;
            }

            const endpoint = `${FEbaseURL}/carts`;

            axios.patch(endpoint, {
                "data": {
                  "id": id,
                  "quantity": num
                }
            })
            .then((res)=>{
                console.log(res);
                renderCart();
            })
            .catch((err)=>{
                console.log(err);
            });
        });
    });
    
}


// 刪除購物車特定品項
function deleteCartItem(){
    const deleteCartItem = Array.from(document.querySelectorAll('.deleteCartItem'));
    deleteCartItem.forEach(item => {
        item.addEventListener('click',()=>{

            const endpoint = `${FEbaseURL}/carts/${item.dataset.id}`;

            axios.delete(endpoint)
            .then((res)=>{
                renderCart();
            })
            .catch((err)=>{
                console.log(err);
            })
        });
    });

}


// 刪除購物車所有品項
function deleteAll(){
    const btn_deleteAll = document.getElementById('btn_deleteAll');
    btn_deleteAll.addEventListener('click',()=>{

        const endpoint = `${FEbaseURL}/carts`;
    
        axios.delete(endpoint)
        .then((res)=>{
            console.log(res);
            renderCart();
        })
        .catch((err)=>{
            console.log(err);
        })
    });
}


// 表單驗證：約束條件設定
let constraints = {
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
};


// 送出訂單
function sendOrder(){
    const sendReserveForm = document.getElementById('sendOrder');
    const reserveForm = document.querySelector('.reserveForm');
    const reserveFormInputs = Array.from(document.querySelectorAll('.reserveForm input, .reserveForm select'));

    // 監聽：送出訂單按鈕
    sendReserveForm.addEventListener('click',()=>{

      // 表單驗證
      let errors = validate(reserveForm, constraints);
      if(errors){
        console.log(errors);
        Object.keys(errors).forEach(key=>{
          const targetElement = document.getElementById(key);
          const msg = errors[key][0].split('/')[1];
          targetElement.innerHTML = msg;
        });
        return;
      }

      // 若購物車是空的，不送出訂單
      if(cartData.carts.length===0) {
        alert('再多逛一下，把喜歡的品項放進購物車喔！');
        return;
      }

      // 驗證通過，送出訂單
      const endpoint = `${FEbaseURL}/orders`;
      axios.post(endpoint,{
          "data": {
            "user": {
              "name": reserveFormInputs[0].value,
              "tel": reserveFormInputs[1].value,
              "email": reserveFormInputs[2].value,
              "address": reserveFormInputs[3].value,
              "payment": reserveFormInputs[4].value
            }
          }
        })
      .then((res)=>{
          console.log(res);

          // 成功送出訂單，sweetalert 跳出成功訊息
          swal({
            title: "成功！",
            text: "已收到您的訂單，請耐心等候到貨。",
            icon: "success",
            button: "OK",
          });

          // 清空表單資料 & 重新渲染購物車列表
          reserveFormInputs.forEach(item => item.value = '');
          renderCart();
      })
      .catch((err)=>{
          console.log(err);
      });

    });
}


// 前台：初始渲染
function init_FE(){
  // 取得產品列表
  getProducts();
  // 渲染購物車列表
  renderCart();
  // 監聽送出訂單資料按鈕
  sendOrder();
  // 監聽產品篩選器：過濾產品列表
  const productsCategory = document.querySelector('.productsCategory');
  productsCategory.addEventListener('change',(e) => {
    if(e.target.value === '全部'){
      renderProducts(productsData);
      return;
    }
    const data = productsData.filter(item => item.category === e.target.value);
    renderProducts(data);
  });
}
