const socket = io();

let productsUpdate = document.getElementById("products");

socket.on("newproduct", (productsList) => {
  productsUpdate.innerHTML = "";
  productsList.forEach((p) => {
    productsUpdate.innerHTML += `
       <tr>
        <td class="row_realtime_table">${p.title}</td>
        <td class="row_realtime_table">${p.description}</td>
        <td class="row_realtime_table">$${p.price}</td>
        <td class="row_realtime_table">${p.code}</td>
        <td class="row_realtime_table">${p.stock}</td>
        <td class="row_realtime_table">${p.status}</td>
        <td class="row_realtime_table">${p.category}</td>
        <td class="row_realtime_table"><img src="${p.thumbnail}" alt="{{p.title}}" width="100" /></td>
      </tr>`;
  });
});

socket.on("deletedproduct", (products) => {
  productsUpdate.innerHTML = "";
  products.forEach((p) => {
    productsUpdate.innerHTML += `
      <tr>
        <td class="row_realtime_table">${p.title}</td>
        <td class="row_realtime_table">${p.description}</td>
        <td class="row_realtime_table">$${p.price}</td>
        <td class="row_realtime_table">${p.code}</td>
        <td class="row_realtime_table">${p.stock}</td>
        <td class="row_realtime_table">${p.status}</td>
        <td class="row_realtime_table">${p.category}</td>
        <td class="row_realtime_table"><img src="${p.thumbnail}" alt="{{p.title}}" width="100" /></td>
      </tr>`;
  });
});
