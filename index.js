const root = document.getElementById('root');

//criando o cabeçalho
const header = document.createElement('header');
header.style.display = 'flex';
header.style.justifyContent = 'space-between';
header.style.padding = '10px';
header.style.borderBottom = '1px solid #ccc';


//adicionando título
const title = document.createElement('h1');
title.innerText = 'Coffee Store';
header.appendChild(title);

//adicionando ícone do carrinho
const cartIcon = document.createElement('div');
cartIcon.innerHTML = `🛒 <span id = "cart-count">0<span/>`;
cartIcon.style.cursor = 'pointer';
cartIcon.addEventListener('click', () => renderCartPage());
header.appendChild(cartIcon);

root.appendChild(header);

updateCartCount();


function renderCoffeeList(){
    fetch('http://localhost:3000/coffee')
        .then(response => response.json())
        .then(data => {
            const coffeeContainer = document.createElement('div');
            coffeeContainer.classList.add('coffee-container');
        
        
        data.forEach(coffee => {
            const coffeeElement = document.createElement('div');
            coffeeElement.classList.add('coffee-item');
            
            coffeeElement.innerHTML = `
                <h3 class = "coffee-title" >${coffee.title}</h3>
                <p class = "coffee-desc" >${coffee.description}</p>
                <p class = "coffee-price" >Preço: R$ ${coffee.price.toFixed(2)}</p>
                <img class = "coffee-img" src="${coffee.image}" alt="${coffee.title}">
                <button data-id= "${coffee.id}">Adicionar ao carrinho</button>
            `;

            const button = coffeeElement.querySelector('button');
            button.addEventListener('click', () => addToCart(coffee))

            coffeeContainer.appendChild(coffeeElement);
        
        });
        
        root.appendChild(coffeeContainer);
    })
    .catch(error => console.error('Erro ao carregar os cafés:', error));
}


function addToCart(coffee){
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === coffee.id);

    if(existingItem){
        existingItem.quantity += 1;
    } else {
        cart.push ({id: coffee.id, title: coffee.title, price:coffee.price, quantity:1})
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}


function updateCartCount(){
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum,item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');

    if(cartCountElement){
        cartCountElement.innerHTML = totalItems;
    }

}

function renderCartPage(){
    root.innerHTML = '';

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;

    const checkoutContainer = document.createElement('div');
    checkoutContainer.style.margin = '20px';

    if(cart.length === 0){
        checkoutContainer.innerHTML = "<p>O carrinho está vazio</p>"
        const backButton = document.createElement('button');
        backButton.innerText = 'Voltar à loja';
        backButton.addEventListener('click', goBackToStore);
        checkoutContainer.appendChild(backButton);
    } else {
        cart.forEach((item, index) =>  {
            const cartItem = document.createElement('div');
            cartItem.style.border = '1px solid #ccc';
            cartItem.style.padding = '10px';
            cartItem.style.marginBottom = '10px';

            const subTotal = item.price * item.quantity;
            total += subTotal;

            cartItem.innerHTML = `
                <div>
                    <h3>${item.title}</h3>
                    <p>Preço: R$ ${item.price.toFixed(2)}</p>
                    <p>Quantidade: ${item.quantity}</p>
                    <p>Subtotal: R$ ${subTotal.toFixed(2)}</p>
                </div>
            `;
            const quantityDiv = document.createElement('div');
            const increaseButton = document.createElement('button');
            increaseButton.innerText = '+';
            increaseButton.addEventListener('click', () => updateQuantity(index,1));

            const decreaseButton = document.createElement('button');
            decreaseButton.innerText = '-';
            decreaseButton.addEventListener('click', () => updateQuantity(index, -1));

            quantityDiv.appendChild(decreaseButton);
            quantityDiv.appendChild(increaseButton);
            cartItem.appendChild(quantityDiv);

            checkoutContainer.appendChild(cartItem);
        });

        const totalElement = document.createElement('h2');
        totalElement.innerText = `Total: R$ ${total.toFixed(2)}`;
        checkoutContainer.appendChild(totalElement);

        const form = document.createElement('form');
        form.innerHTML = `
            <label for = "address">Endereço de entrega:</label>
            <input type = "text" id="address" name = "address" required placeholder = "Informe seu endereço"><br><br>
            
            <label for = "payment-method">Método de pagamento:</label>
            <select id = "payment-method" name = "payment-method" required>
                <option value = "credit-card">Cartão de crédito</option>
                <option value = "boleto">Boleto</option>
                <option value = "pix">Pix</option>
            </select><br><br>

            <button type = "submit">Finalizar Compra</button>
        `;

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const address = document.getElementById('address').value;
            const paymentMethod = document.getElementById('payment-method').value;

            if(address && paymentMethod){
                const confirmationMessage = document.createElement('div');
                confirmationMessage.style.textAlign = 'center';
                confirmationMessage.innerHTML = `
                    <h1>Compra finalizada com sucesso!</h1>
                    <p>Obrigado pela sua compra. O seu pedido será enviado para: ${address}</p>
                    <p>Método de pagamento: ${paymentMethod}</p>
                    <button onclick = "goBackToStore()">Voltar à loja</button>    
                `;
                checkoutContainer.innerHTML = '';
                checkoutContainer.appendChild(confirmationMessage);

                localStorage.removeItem('cart');
                updateCartCount();
            } else {
                alert("Por favor, preencha todos os campos corretamente.")
            }
        });

        checkoutContainer.appendChild(form);
    }

    const backButton = document.createElement('button');
    backButton.innerText = 'Voltar à loja';
    backButton.style.marginTop = '20px';
    backButton.style.padding = '10px';

    backButton.addEventListener('click', () => {
        root.innerHTML = '';
        root.appendChild(header);
        renderCoffeeList();
        updateCartCount();
    })
    checkoutContainer.appendChild(backButton);
    root.appendChild(checkoutContainer);
}

function goBackToStore(){
    root.innerHTML = '';
    root.appendChild(header);
    renderCoffeeList();
    updateCartCount();
}



function updateQuantity(index, change){
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if(cart[index]){
        cart[index].quantity += change;

        if(cart[index].quantity <= 0){
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartPage();
        updateCartCount();
    }
}


renderCoffeeList();
updateCartCount();