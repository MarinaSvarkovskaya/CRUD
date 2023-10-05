// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Product {
  static #list = []

  static #count = 0

  constructor(
    img,
    title,
    description,
    category,
    price,
    amount = 0,
  ) {
    this.id = ++Product.#count
    this.img = img
    this.title = title
    this.description = description
    this.category = category
    this.price = price
    this.amount = amount
  }

  static add = (...data) => {
    const newProduct = new Product(...data)
    this.#list.push(newProduct)
  }

  static getList = () => {
    return this.#list
  }

  static getById = (id) => {
    return this.#list.find((product) => product.id === id)
  }

  static getRandomList = (id) => {
    const filteredList = this.#list.filter(
      (product) => product.id !== id,
    )

    const shuffledList = filteredList.sort(
      () => Math.random() - 0.5,
    )

    return shuffledList.slice(0, 3)
  }
}

Product.add(
  'https://picsum.photos/200/300',
  `Комп'ютер Artline Gaming (X43v31) AMD Ryzen 5 3600/`,
  `AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 480 ГБ / nVidia GeForce RTX 3050, 8 ГБ / без ОД / LAN / без ОС`,
  [
    { id: 1, text: 'Готовий до відправки' },
    { id: 2, text: 'Топ продажів' },
  ],
  27000,
  100,
)

Product.add(
  'https://picsum.photos/200/300',
  `Комп'ютер Artline Gaming (X43v31) AMD Ryzen 5 3600/`,
  `AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 480 ГБ / nVidia GeForce RTX 3050, 8 ГБ / без ОД / LAN / без ОС`,
  [{ id: 2, text: 'Топ продажів' }],
  20000,
  100,
)

Product.add(
  'https://picsum.photos/200/300',
  `Комп'ютер Artline Gaming (X43v31) AMD Ryzen 5 3600/`,
  `AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 480 ГБ / nVidia GeForce RTX 3050, 8 ГБ / без ОД / LAN / без ОС`,
  [{ id: 1, text: 'Готовий до відправки' }],
  40000,
  100,
)

class Purchase {
  static DELIVERY_PRICE = 150
  static #BONUS_FACTOR = 0.1

  static #count = 0
  static #list = []

  static #bonusAccount = new Map()

  static getBonusBalance = (email) => {
    return Purchase.#bonusAccount.get(email) || 0
  }

  static calcBonusAmount = (value) => {
    return value * Purchase.#BONUS_FACTOR
  }

  static updateBonusBalance = (
    email,
    price,
    bonusUse = 0,
  ) => {
    const amount = this.calcBonusAmount(price)
    const currentBalance = Purchase.getBonusBalance(email)

    const updatedBalance =
      currentBalance + amount - bonusUse

    Purchase.#bonusAccount.set(email, updatedBalance)

    console.log(email, updatedBalance)
    return amount
  }

  constructor(data, product) {
    this.id = ++Purchase.#count

    this.firstname = data.firstname
    this.lastname = data.lastname

    this.phone = data.phone
    this.email = data.email

    this.comment = data.comment || null
    this.bonus = data.bonus || 0

    this.promocode = data.promocode || null

    this.totalPrice = data.totalPrice
    this.productPrice = data.productPrice
    this.deliveryPrice = data.deliveryPrice
    this.amount = data.amount

    this.product = product
  }

  static add = (...arg) => {
    const newPurchase = new Purchase(...arg)
    this.#list.push(newPurchase)
    return newPurchase
  }

  static getList = () => {
    return Purchase.#list.reverse()
  }

  static getById = () => {
    return Purchase.#list.find((item) => item.id === id)
  }

  static updateById = (id, data) => {
    const purchase = Purchase.getById(id)

    if (purchase) {
      if (data.firstname)
        purchase.firstname = data.firstname
      if (data.lastname) purchase.lastname = data.lastname
      if (data.phone) purchase.phone = data.phone
      if (data.email) purchase.email = data.email
      return true
    } else {
      return false
    }
  }
}

class Promocode {
  static #list = []

  constructor(name, factor) {
    this.name = name
    this.factor = factor
  }

  static add = (name, factor) => {
    const newPromoCode = new Promocode(name, factor)
    Promocode.#list.push(newPromoCode)
    return newPromoCode
  }

  static getByName = (name) => {
    return this.#list.find((promo) => promo.name === name)
  }

  static calc = (promo, price) => {
    return price * promo.factor
  }
}

Promocode.add('SUMMER2023', 0.9)
Promocode.add('DISCOUNT50', 0.9)
Promocode.add('SALE25', 0.9)
// ================================================================

// ================================================================

router.get('/', function (req, res) {
  res.render('purchase-index', {
    style: 'purchase-index',

    data: {
      list: Product.getList(),
    },
  })
})

// ================================================================

router.get('/purchase-product', function (req, res) {
  const id = Number(req.query.id)
  res.render('purchase-product', {
    style: 'purchase-product',

    data: {
      list: Product.getRandomList(id),
      product: Product.getById(id),
    },
  })
})
// ================================================================

router.post('/purchase-create', function (req, res) {
  const id = Number(req.query.id)
  const amount = Number(req.body.amount)

  if (amount < 1) {
    return res.render('alert', {
      style: 'alert',

      data: {
        link: `/purchase-product?id=${id}`,
        title: 'Помилка',
        info: 'Некоректна кількість товару',
      },
    })
  }

  const product = Product.getById(id)

  if (product.amount < 1) {
    return res.render('alert', {
      style: 'alert',

      data: {
        link: `/purchase-product?id=${id}`,
        title: 'Помилка',
        info: 'Такої кількості товару немає в намявнсисті',
      },
    })
  }

  console.log(product, amount)

  const productPrice = product.price * amount
  const totalPrice = productPrice + Purchase.DELIVERY_PRICE
  const bonus = Purchase.calcBonusAmount(totalPrice)

  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('purchase-create', {
    style: 'purchase-create',

    data: {
      title: 'Ваше замовлення',
      subtitle: 'Оформлення замовлення',

      id: product.id,

      cart: [
        {
          text: `${product.title} (${amount} шт)`,
          price: product.price,
        },
        {
          text: 'Вартість доставки',
          price: Purchase.DELIVERY_PRICE,
        },
      ],
      totalPrice,
      productPrice,
      amount,
      bonus,
      deliveryPrice: Purchase.DELIVERY_PRICE,
    },
  })
})

// ================================================================

router.post('/purchase-submit', function (req, res) {
  const id = Number(req.query.id)

  let {
    totalPrice,
    productPrice,
    deliveryPrice,
    amount,

    firstname,
    lastname,
    email,
    phone,
    comment,
    delivery,

    promocode,
    bonus,
  } = req.body

  const product = Product.getById(id)

  if (!product) {
    return res.render('alert', {
      style: 'alert',

      data: {
        link: '/purchase-list',
        title: 'Помилка',
        info: 'Товар не знайдено',
      },
    })
  }

  if (product.amount < amount) {
    return res.render('alert', {
      style: 'alert',

      data: {
        link: '/purchase-list',
        title: 'Помилка',
        info: 'Товару немає в потрібній кількості',
      },
    })
  }

  totalPrice = Number(totalPrice)
  productPrice = Number(productPrice)
  deliveryPrice = Number(deliveryPrice)
  amount = Number(amount)
  bonus = Number(bonus)

  if (
    isNaN(totalPrice) ||
    isNaN(productPrice) ||
    isNaN(deliveryPrice) ||
    isNaN(amount) ||
    isNaN(bonus)
  ) {
    return res.render('alert', {
      style: 'alert',

      data: {
        link: '/purchase-list',
        title: 'Помилка',
        info: 'Некорректні данні',
      },
    })
  }

  if ((!firstname, !lastname, !email, !phone, !delivery)) {
    return res.render('alert', {
      style: 'alert',

      data: {
        link: '/purchase-list',
        title: "Заповніть обов'язкові поля",
        info: 'Некорректні данні',
      },
    })
  }

  if (bonus || bonus > 0) {
    const bonusAmount = Purchase.getBonusBalance(email)

    console.log(bonusAmount)

    if (bonus > bonusAmount) {
      bonus = bonusAmount
    }

    Purchase.updateBonusBalance(email, totalPrice, bonus)

    totalPrice -= bonus
  } else {
    Purchase.updateBonusBalance(email, totalPrice, 0)
  }

  if (promocode) {
    promocode = Promocode.getByName(promocode)

    if (promocode) {
      totalPrice = Promocode.calc(promocode, totalPrice)
    }
  }

  if (totalPrice < 0) totalPrice = 0

  console.log(
    totalPrice,
    productPrice,
    deliveryPrice,
    amount,

    firstname,
    lastname,
    email,
    phone,

    promocode,
    bonus,
    comment,
    delivery,
  )

  const purchase = Purchase.add(
    {
      totalPrice,
      productPrice,
      deliveryPrice,
      amount,

      firstname,
      lastname,
      email,
      phone,

      promocode,
      bonus,
      comment,
      delivery,
    },
    product,
  )

  console.log(purchase)

  res.render('alert', {
    style: 'alert',
    component: ['button', 'heading'],

    data: {
      link: '/purchase-list',
      title: 'Успішне виконання дії',
      info: 'Замовлення створене',
    },
  })
})

// ================================================================

router.get('/purchase-list', function (req, res) {
  const list = Purchase.getList()

  if (list.length === 0) {
    res.render('alert', {
      style: 'alert',

      data: {
        link: '/purchase-product',
        title: 'Ваш список замовлень пустий',
        info: 'Ваш список замовлень пустий',
      },
    })
  } else {
    console.log('purchase-list:', list)
    res.render('purchase-list', {
      style: 'purchase-list',

      data: {
        purchase: {
          list,
        },
      },
    })
  }
})

// ================================================================

router.get('/purchase-info', function (req, res) {
  const id = Number(req.query.id)
  const purchase = Purchase.getById(id)
  const bonus = Purchase.calcBonusAmount(
    purchase.totalPrice,
  )

  res.render('purchase-info', {
    style: 'purchase-info',

    data: {
      id: purchase.id,
      firstname: purchase.firstname,
      lastname: purchase.lastname,
      phone: purchase.phone,
      email: purchase.email,
      delivery: purchase.delivery,
      product: purchase.product.title,
      productPrice: purchase.productPrice,
      deliveryPrice: purchase.deliveryPrice,
      totalPrice: purchase.totalPrice,
      bonus: bonus,
    },
  })
})

// ================================================================

router.get('/purchase-edit', function (req, res) {
  const id = Number(req.query.id)
  const purchase = Purchase.getById(id)

  if (!purchase) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Товар не знайдено',
        link: `/purchase-list`,
      },
    })
  } else {
    res.render('purchase-edit', {
      style: 'purchase-edit',

      data: {
        id: purchase.id,
        firstname: purchase.firstname,
        lastname: purchase.lastname,
        phone: purchase.phone,
        email: purchase.email,
        delivery: purchase.delivery,
      },
    })
  }
})

// ================================================================
router.post('/purchase-edit', function (req, res) {
  const id = Number(req.query.id)
  let { firstname, lastname, phone, email, delivery } =
    req.body

  const purchase = Purchase.getById(id)

  console.log(purchase)

  if (purchase) {
    const newPurchase = Purchase.updateById(id, {
      firstname,
      lastname,
      phone,
      email,
      delivery,
    })

    console.log(newPurchase)

    if (newPurchase) {
      res.render('alert', {
        style: 'alert',

        data: {
          link: '/purchase-list',
          title: 'Успішне виконання дії',
          info: 'Товар успішно оновлено',
        },
      })
    } else {
      res.render('alert', {
        style: 'alert',

        data: {
          link: '/purchase-list',
          title: 'Помилка',
          info: 'Не вдалося оновити товар',
        },
      })
    }
  } else {
    res.render('alert', {
      style: 'alert',

      data: {
        link: '/purchase-list',
        title: 'Помилка',
        info: 'Не вдалося оновити товар',
      },
    })
  }
})

// ================================================================
// Підключаємо роутер до бек-енду
module.exports = router
