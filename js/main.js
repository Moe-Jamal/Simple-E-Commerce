// Tooltips
function reinitializeTooltips() {
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltips.forEach((tooltip) => {
    // Dispose of the existing tooltip
    const bsTooltip = bootstrap.Tooltip.getInstance(tooltip);
    if (bsTooltip) {
      bsTooltip.dispose();
    }
    // Reinitialize the tooltip
    new bootstrap.Tooltip(tooltip);
  });
}
const sideBar = document.querySelector(".sidebar");
const sideBarToggler = document.querySelector(".sideBar-toggle");
const menuToggler = document.querySelector(".menu-toggle");
const collapsedSidebarHight = "56px";
const fullsidebarHight = "calc(100vh - 32px)";
const mainContent = document.querySelector(".layout");

function sideBarCollapes() {
  sideBar.classList.toggle("collapsed");
  mainContent.classList.toggle("fullwidth");
}
sideBarToggler.addEventListener("click", sideBarCollapes);

function toggleMenu(isManuActive) {
  sideBar.style.height = isManuActive
    ? `${sideBar.scrollHeight}px`
    : collapsedSidebarHight;
  menuToggler
    .querySelector("i")
    .classList.replace(
      isManuActive ? "fa-bars" : "fa-xmark",
      isManuActive ? "fa-xmark" : "fa-bars"
    );
}
menuToggler.addEventListener("click", () => {
  toggleMenu(sideBar.classList.toggle("menu-active"));
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 992) {
    sideBar.style.height = fullsidebarHight;
  } else {
    sideBar.classList.remove("collapsed");
    sideBar.style.height = "auto";
    toggleMenu(sideBar.classList.contains("menu-active"));
    mainContent.classList.remove("fullwidth");
  }
});

// start mangment system (CRUD)

const productNameInput = document.getElementById("productName");
const productCategorySelection = document.getElementById("productCategory");
const productPriceBeforeDiscount = document.getElementById("productPrice");
const productDiscount = document.getElementById("discount");
const productDesciption = document.getElementById("productDescription");
const productImage = document.getElementById("productImage");
const addBtn = document.getElementById("addProduct");
const updateBtn = document.getElementById("updateProduct");
const productList = JSON.parse(localStorage.getItem("productContainer")) || [];
const totalPrice = document.getElementById("totalPrice");
const productForm = document.getElementById("productForm");
const tableData = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const searchOptions = document.querySelectorAll('input[name="searchOption"]');
let currentIndex;

// Sets multiple attributes on an element
function setAttributes(element, attributes) {
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
}

function updateTotalPrice() {
  const originalPrice = parseFloat(productPriceBeforeDiscount.value) || 0;
  const discount = parseFloat(productDiscount.value) || 0;
  const finalPrice = originalPrice - discount;
  totalPrice.textContent = finalPrice.toFixed(2);
}
productPriceBeforeDiscount.addEventListener("input", updateTotalPrice);
productDiscount.addEventListener("input", updateTotalPrice);

function addProduct() {
  if (
    validationInput(productNameInput, "inValidName") &&
    validationInput(productPriceBeforeDiscount, "inValidPrice") &&
    validationInput(productDesciption, "inValidDescription") &&
    validationInput(productImage, "inValidImage")
  ) {
    const originalPrice = parseFloat(productPriceBeforeDiscount.value) || 0;
    const discount = parseFloat(productDiscount.value) || 0;
    const finalPrice = originalPrice - discount;
    const product = {
      name: productNameInput.value.trim(),
      originalPrice,
      discount,
      finalPrice,
      category: productCategorySelection.value.trim(),
      description: productDesciption.value.trim(),
      image: productImage.files[0]
        ? `./images/${productImage.files[0]?.name}`
        : "./images/myLogo.jpg",
      onSale: discount > 0,
    };

    productList.push(product);
    createTableData(product, productList.length - 1);
    createProductElement(product);
    localStorage.setItem("productContainer", JSON.stringify(productList));
    productForm.reset();
    clearValidation();
    updateTotalPrice();
  }
}

function createTableData(product, index) {
  const tableRow = document.createElement("tr");
  const tableContnet = [
    index + 1,
    product.name,
    product.finalPrice,
    product.category,
    product.description,
  ];

  tableContnet.forEach((data) => {
    const productInfo = document.createElement("td");
    productInfo.classList.add("text-capitalize");
    productInfo.textContent = data;
    tableRow.append(productInfo);
  });

  const productImage = document.createElement("td");
  const img = document.createElement("img");
  img.src = product.image;
  img.alt = product.name;
  productImage.appendChild(img);
  const productActions = document.createElement("td");
  productActions.classList.add("text-nowrap");
  const updateBtn = document.createElement("button");
  updateBtn.classList.add(
    "btn",
    "btn-outline-warning",
    "btn-sm",
    "mb-1",
    "me-1"
  );
  setAttributes(updateBtn, {
    "data-bs-toggle": "tooltip",
    "data-bs-placement": "top",
    "data-bs-title": "Update",
    "data-bs-custom-class": "custom-tooltip",
  });
  const updateIcon = document.createElement("i");
  updateIcon.classList.add("fa-solid", "fa-pen-to-square");
  updateBtn.appendChild(updateIcon);
  updateBtn.addEventListener("click", () => {
    setUpdateProduct(index);
  });
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add(
    "btn",
    "btn-outline-danger",
    "btn-sm",
    "mb-1",
    "me-1"
  );
  setAttributes(deleteBtn, {
    "data-bs-toggle": "tooltip",
    "data-bs-placement": "top",
    "data-bs-title": "Delete",
    "data-bs-custom-class": "custom-tooltip",
  });
  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid", "fa-trash");
  deleteBtn.appendChild(deleteIcon);
  deleteBtn.addEventListener("click", () => {
    deleteProduct(index);
  });
  productActions.append(updateBtn, deleteBtn);

  tableRow.append(productImage, productActions);
  tableData.appendChild(tableRow);
  reinitializeTooltips();
}

function displayTableData() {
  tableData.innerHTML = "";
  let serachText = searchInput.value.toLowerCase();
  const categorySearchOption = document.querySelector(
    'input[name="searchOption"]:checked'
  );
  if (productList.length > 0) {
    for (let i = 0; i < productList.length; i++) {
      if (
        categorySearchOption.value == "name" &&
        productList[i].name.toLowerCase().includes(serachText)
      ) {
        searchInput.placeholder = "Search By Name";
        createTableData(productList[i], i);
      } else if (
        categorySearchOption.value == "category" &&
        productList[i].category.toLowerCase().includes(serachText)
      ) {
        searchInput.placeholder = "Search By Category";
        createTableData(productList[i], i);
      }
    }
  }
}

function deleteProduct(index) {
  productList.splice(index, 1);
  localStorage.setItem("productContainer", JSON.stringify(productList));
  reinitializeTooltips();
  displayTableData();
  displayData();
}

function setUpdateProduct(index) {
  currentIndex = index;
  productNameInput.value = productList[index].name;
  productCategorySelection.value = productList[index].category;
  productPriceBeforeDiscount.value = productList[index].originalPrice;
  productDiscount.value = productList[index].discount;
  productDesciption.value = productList[index].description;
  totalPrice.textContent = productList[index].finalPrice.toFixed(2);
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  addBtn.classList.add("d-none");
  updateBtn.classList.remove("d-none");
  reinitializeTooltips();
}

function updateProduct() {
  if (
    validationInput(productNameInput, "inValidName") &&
    validationInput(productPriceBeforeDiscount, "inValidPrice") &&
    validationInput(productDesciption, "inValidDescription") &&
    validationInput(productImage, "inValidImage")
  ) {
    const originalPrice = parseFloat(productPriceBeforeDiscount.value) || 0;
    const discount = parseFloat(productDiscount.value) || 0;
    const finalPrice = originalPrice - discount;
    const product = {
      name: productNameInput.value.trim(),
      originalPrice,
      discount,
      finalPrice,
      category: productCategorySelection.value.trim(),
      description: productDesciption.value.trim(),
      image: productImage.files[0]
        ? `./images/${productImage.files[0]?.name}`
        : "./images/myLogo.jpg",
      onSale: discount > 0,
    };

    productList.splice(currentIndex, 1, product);
    localStorage.setItem("productContainer", JSON.stringify(productList));
    displayTableData();
    displayData();
    productForm.reset();
    clearValidation();
    updateTotalPrice();
    addBtn.classList.remove("d-none");
    updateBtn.classList.add("d-none");
  }
}

function validationInput(input, inValidMsg) {
  const regex = {
    productName: /^[a-zA-Z][a-zA-Z0-9\s\-]{2,39}$/,
    productPrice: /^\d{2,6}(\.\d{1,2})?$/,
    productDescription: /^[a-zA-Z0-9\s.,!@#$%&*()\-_'":;?/]{10,500}$/,
    productImage: /^.*\.(jpg|jpeg|png|gif|avif|svg|webp)$/i,
  };
  const inputValue = input.value;
  const msg = document.getElementById(inValidMsg);

  if (regex[input.id].test(inputValue)) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    msg.classList.add("d-none");
    return true;
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    msg.classList.remove("d-none");
    return false;
  }
}

function validDiscount() {
  const regex = /^(\d{2,6}(\.\d{1,2})?)?$/;
  const disccontValue = parseFloat(productDiscount.value);
  const discountMsg = document.getElementById("invalidDiscount");
  const discountElement = document.getElementById("discountMsg");

  if (disccontValue === "") {
    productDiscount.classList.remove("is-invalid", "is-valid");
    discountMsg.classList.add("d-none");
    return true;
  } else if (
    regex.test(disccontValue) &&
    disccontValue < parseFloat(productPriceBeforeDiscount.value)
  ) {
    productDiscount.classList.add("is-valid");
    productDiscount.classList.remove("is-invalid");
    discountMsg.classList.add("d-none");
    return true;
  } else {
    productDiscount.classList.remove("is-valid");
    productDiscount.classList.add("is-invalid");
    discountMsg.classList.remove("d-none");
    return false;
  }
}
function clearValidation() {
  productNameInput.classList.remove("is-valid");
  productPriceBeforeDiscount.classList.remove("is-valid");
  productDesciption.classList.remove("is-valid");
  productImage.classList.remove("is-valid");
  productDiscount.classList.remove("is-valid");
}
const graphicCardData = document.querySelector(".graphic-cards #rowData");
const processorData = document.querySelector(".processor #rowData");
const motherBoardData = document.querySelector(".motherboard #rowData");
const computerCaseData = document.querySelector(".computer-case #rowData");
const powerSupplyData = document.querySelector(".power-supply #rowData");
const laptopsData = document.querySelector(".laptops #rowData");
const onSaleData = document.querySelector(".onsale #rowData");
const productsControl = document.querySelector(".products-control");
const productSearchInput = document.getElementById("productSearchInput");

function createProductElement(product) {
  const cols = document.createElement("div");
  cols.classList.add("col-md-6", "col-lg-4", "col-xl-3");
  const productCard = document.createElement("div");
  productCard.classList.add("card", "border-0");

  const imgHolder = document.createElement("div");
  imgHolder.classList.add("img-holder", "position-relative", "overflow-hidden");
  const productImg = document.createElement("img");
  productImg.classList.add("card-img-top", "rounded-0");
  productImg.alt = product.name;
  productImg.src = product.image;
  const sale = document.createElement("span");
  sale.classList.add("sale", "small");
  if (!product.onSale) {
    sale.classList.add("d-none");
  }
  sale.textContent = "Sale";
  const imgLayer = document.createElement("div");
  imgLayer.classList.add(
    "layer",
    "d-flex",
    "justify-content-center",
    "align-items-center"
  );
  const productInfoIcon = document.createElement("i");
  productInfoIcon.classList.add("fa-solid", "fa-magnifying-glass");
  imgLayer.appendChild(productInfoIcon);
  imgHolder.append(productImg, sale, imgLayer);

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  const cardText = document.createElement("div");
  cardText.classList.add("card-text");
  const productTitle = document.createElement("h3");
  productTitle.classList.add("title", "fs-5");
  productTitle.textContent = product.name;
  const totalPrice = document.createElement("span");
  totalPrice.classList.add("main-color", "me-1");
  totalPrice.textContent = `${product.finalPrice} EGP`;
  const originalPrice = document.createElement("span");
  originalPrice.classList.add(
    "text-secondary",
    "text-decoration-line-through",
    "small"
  );
  originalPrice.textContent = `${product.originalPrice} EGP`;
  if (product.originalPrice == product.finalPrice) {
    originalPrice.classList.add("d-none");
  }

  const cartHolder = document.createElement("div");
  cartHolder.classList.add("d-flex", "justify-content-between", "mt-3");
  const addToCartBtn = document.createElement("button");
  addToCartBtn.classList.add("btn", "btn-sm", "py-2", "cart");
  addToCartBtn.textContent = "ADD TO CART";
  const addToFavHolder = document.createElement("span");
  addToFavHolder.classList.add("d-flex", "align-items-center");
  const addToFavIcon = document.createElement("i");
  addToFavIcon.classList.add("fa-regular", "fa-heart", "fa-2x", "fav-icon");
  addToFavIcon.addEventListener("click", () => {
    if (addToFavIcon.classList.contains("fa-regular")) {
      addToFavIcon.classList.replace("fa-regular", "fa-solid");
      addToFavIcon.style.color = "red";
    } else {
      addToFavIcon.classList.replace("fa-solid", "fa-regular");
      addToFavIcon.style.color = "#151A2D";
    }
  });
  addToFavHolder.appendChild(addToFavIcon);

  cartHolder.append(addToCartBtn, addToFavHolder);
  cardText.append(productTitle, totalPrice, originalPrice, cartHolder);
  cardBody.appendChild(cardText);
  productCard.append(imgHolder, cardBody);
  cols.appendChild(productCard);

  if (product.onSale) {
    const clonedNode = cols.cloneNode(true);
    onSaleData.appendChild(clonedNode);
    const clonedFavIcon = clonedNode.querySelector(".fav-icon");
    clonedFavIcon.addEventListener("click", () => {
      if (clonedFavIcon.classList.contains("fa-regular")) {
        clonedFavIcon.classList.replace("fa-regular", "fa-solid");
        clonedFavIcon.style.color = "red";
      } else {
        clonedFavIcon.classList.replace("fa-solid", "fa-regular");
        clonedFavIcon.style.color = "#151A2D";
      }
    });
  }

  if (product.category == "Grahpic Card") {
    graphicCardData.appendChild(cols);
  } else if (product.category == "Processor") {
    processorData.appendChild(cols);
  } else if (product.category == "Motherboard") {
    motherBoardData.appendChild(cols);
  } else if (product.category == "Computer Case") {
    computerCaseData.appendChild(cols);
  } else if (product.category == "Power Supply") {
    powerSupplyData.appendChild(cols);
  } else if (product.category == "Laptops") {
    laptopsData.appendChild(cols);
  }
}

function displayData() {
  graphicCardData.innerHTML = "";
  processorData.innerHTML = "";
  motherBoardData.innerHTML = "";
  computerCaseData.innerHTML = "";
  powerSupplyData.innerHTML = "";
  laptopsData.innerHTML = "";
  onSaleData.innerHTML = "";
  const searchText = productSearchInput.value.toLowerCase();
  if (productList.length > 0) {
    for (let i = 0; i < productList.length; i++) {
      if (productList[i].name.toLowerCase().includes(searchText)) {
        createProductElement(productList[i]);
      }
    }
  }
}
productNameInput.addEventListener("blur", () => {
  validationInput(productNameInput, "inValidName");
});
productDesciption.addEventListener("blur", () => {
  validationInput(productDesciption, "inValidDescription");
});
productPriceBeforeDiscount.addEventListener("blur", () => {
  validationInput(productPriceBeforeDiscount, "inValidPrice");
});
productImage.addEventListener("change", () => {
  validationInput(productImage, "inValidImage");
});
productDiscount.addEventListener("blur", validDiscount);
addBtn.addEventListener("click", addProduct);
searchOptions.forEach((option) => {
  option.addEventListener("change", displayTableData);
});
window.addEventListener("load", displayTableData);
searchInput.addEventListener("input", displayTableData);
updateBtn.addEventListener("click", updateProduct);

window.addEventListener("load", () => {
  displayData();
});
productSearchInput.addEventListener("input", () => {
  displayData();
});

// Sort Proudcts

const sortProductsSelection = document.getElementById("sortProducts");

function sortProducts() {
  if (sortProductsSelection.value === "default") {
    displayData();
  } else if (sortProductsSelection.value === "nameA-Z") {
    productList.sort((a, b) => a.name.localeCompare(b.name));
    displayData();
  } else if (sortProductsSelection.value === "nameZ-A") {
    productList.sort((a, b) => a.name.localeCompare(b.name)).reverse();
    displayData();
  } else if (sortProductsSelection.value === "priceHighLow") {
    productList.sort((a, b) => b.finalPrice - a.finalPrice);
    displayData();
  } else if (sortProductsSelection.value === "priceLowHigh") {
    productList.sort((a, b) => a.finalPrice - b.finalPrice);
    displayData();
  }
}

sortProductsSelection.addEventListener("change", sortProducts);

// show and hide taps
document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    const targetId = this.getAttribute("data-target");
    let currentTap = document.getElementById(targetId);
    document.getElementById(targetId).classList.add("active");

    if (
      currentTap === document.getElementById("home") ||
      currentTap === document.getElementById("adminTap")
    ) {
      productsControl.classList.add("d-none");
    } else {
      productsControl.classList.remove("d-none");
    }
  });
});
