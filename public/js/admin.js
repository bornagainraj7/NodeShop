const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article');

    fetch(`/admin/product/${prodId}/delete`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(result => {
        return result.json();
    })
    .then(data => {
        console.log(data);
        // productElement.remove(); // won't work on IE
        productElement.parentNode.removeChild(productElement); // will work on every browser
    }) 
    .catch(err => console.log(err));
}