const form = document.querySelector("form");
const url = document.querySelector("input");
const tbody = document.querySelector("tbody");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await fetch("http://localhost:5000/api/addShortUrl", {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full: url.value,
      }),
    });
    url.value = "";
    fetchUrls();
  } catch (err) {
    console.log(err);
  }
});

async function fetchUrls() {
  try {
    const { shortUrls } = await fetch("http://localhost:5000/", {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }).then((data) => data.json());
    const html = shortUrls
      .map((el) => {
        return `<tr>
                <td><a href="${el.full}">${el.full}</a></td>
                <td><a href="http://localhost:5000/api/${el.short}">${el.short}</a></td>
                <td>${el.clicks}"</td>
                <td><a href="http://localhost:5000/api/delete/${el.short}"><span class="fas fa-times remove removebtn" data-link="${el.short}"></span>
                </a></td>   
              </tr>`;
      })
      .join(" ");
    tbody.innerHTML = html;
  } catch (err) {
    console.log(err);
  }
}

fetchUrls();
