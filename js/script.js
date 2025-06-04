// Check authentication on page load
function checkAuth() {
  const authToken = localStorage.getItem("authToken");
  const tokenExpiration = localStorage.getItem("tokenExpiration");

  if (!authToken || !tokenExpiration) {
    logout();
    return false;
  }

  // Check if token has expired
  if (new Date().getTime() > parseInt(tokenExpiration)) {
    logout();
    return false;
  }

  return true;
}

// Add logout function
function logout() {
  localStorage.removeItem("authToken");
  window.location.href = "login.html";
}

// vars
let title = document.querySelector("#title");
let letters = document.querySelector("#letters");
let category = document.querySelector("#category");
let submit = document.querySelector("#submit");
let mood = "create";
let tmp;
let productsArr = [];
// Add auth token variable - this should be set when user logs in
let authToken = localStorage.getItem("authToken");

//events
submit.addEventListener("click", async function (e) {
  if (mood === "create") {
    await creatProd();
  } else {
    await updateExistingProd();
  }
});

//functions
async function creatProd() {
  if (!checkAuth()) return;

  let car = {
    number: title.value,
    letters: letters.value.split("").join(" "),
    governorate: category.value,
  };

  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/cars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(car),
    });

    if (response.status === 401) {
      logout();
      return;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create car");
    }

    console.log("Product sent:", data);
    clearInputs();
    await showProd();
  } catch (error) {
    console.error("Error:", error);
    alert(error.message);
  }
}

function clearInputs() {
  title.value = "";
  letters.value = "";
  category.value = "";
  submit.innerHTML = "احفظ";
  mood = "create";
}

async function showProd() {
  if (!checkAuth()) return;

  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/cars", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Server error occurred");
    }
    console.log(response);
    productsArr = data.data.docs;

    let table = "";
    productsArr.forEach((car, i) => {
      table += `<tr>
                  <td class="id">${i + 1}</td>
                  <td class="title">${car.number}</td>
                  <td class="title">${car.letters}</td>
                  <td class="category">${car.governorate}</td>
                  <td class="update">                    <button class="update-btn" onclick="updateProd(${i})">عدل</button>
                  </td>
                </tr>`;
    });
    document.getElementById("output").innerHTML = table;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

async function updateExistingProd() {
  if (!checkAuth()) return;

  const car = {
    number: title.value,
    letters: letters.value.split("").join(" "),
    governorate: category.value,
  };

  try {
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/cars/${productsArr[tmp]._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(car),
      }
    );

    if (response.status === 401) {
      logout();
      return;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update car");
    }

    console.log("Car updated:", data);
    clearInputs();
    await showProd();
  } catch (error) {
    console.error("Error updating car:", error);
    alert(error.message);
  }
}

async function updateProd(i) {
  title.value = productsArr[i].number;
  letters.value = productsArr[i].letters.split(" ").join("");
  category.value = productsArr[i].governorate;

  scroll({
    top: 0,
    behavior: "smooth",
  });

  submit.innerHTML = "عدل";
  mood = "update";
  tmp = i;
}

let searchMood = "title";
let searchInput = document.getElementById("search");

function searchBtnAction(id) {
  searchInput.focus();

  if (id === "title-search") {
    searchMood = "title";
    searchInput.placeholder = "ابحث برقم السيارة";
  } else {
    searchMood = "category";
    searchInput.placeholder = "ابحث باستخدام المحافظة";
  }

  searchInput.value = "";
  showProd(); // Reset the table
}

function searchForProducts() {
  let table = "";
  const searchValue = searchInput.value.trim().toLowerCase();

  const filteredCars = productsArr.filter((car) => {
    if (searchMood === "title") {
      return car.number.toString().includes(searchValue);
    } else {
      return car.governorate.toLowerCase().includes(searchValue);
    }
  });

  filteredCars.forEach((car, i) => {
    table += `<tr>
                <td class="id">${i + 1}</td>
                <td class="title">${car.number}</td>
                <td class="title">${car.letters}</td>
                <td class="category">${
                  car.governorate
                }</td>                <td class="update">
                  <button class="update-btn" onclick="updateProd(${productsArr.indexOf(
                    car
                  )})">عدل</button>
                </td>
              </tr>`;
  });

  document.getElementById("output").innerHTML = table;
}

// Initial load
showProd();
checkAuth();
