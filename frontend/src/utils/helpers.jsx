import icons from "./icons"

const { AiOutlineStar, AiFillStar } = icons

export const calculateTotal = (products) => {
  if (!products || products.length === 0) return 0;

  return products.reduce((sum, product) => {
    return sum + product.price * product.quantity;
  }, 0);
};

export const createSlug = (string) => {
  return string
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa ký tự Unicode
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu tiếng Việt
    .replace(/đ/g, "d") // Chuyển đổi ký tự "đ"
    .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ ký tự không hợp lệ
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-") // Xóa dấu gạch ngang dư thừa
    .trim(); // Loại bỏ khoảng trắng đầu và cuối
};

export const slugToTitleMap = {
  "dien-thoai": "Điện thoại",
  "tai-nghe": "Tai nghe",
  "may-tinh-bang": "Máy tính bảng",
  "dong-ho-thong-minh": "Đồng hồ thông minh"
};

export const formatMoney = (number) =>
  Number(number?.toFixed(1)).toLocaleString()

export const renderStarFromNumber = (number, size) => {
  if (!Number(number)) return
  const stars = []
  number = Math.round(number)
  for (let i = 0; i < +number; i++)
    stars.push(<AiFillStar color="orange" size={size || 16} />)
  for (let i = 5; i > +number; i--)
    stars.push(<AiOutlineStar color="orange" size={size || 16} />)
  return stars
}
export function secondsToHms(d) {
  d = Number(d) / 1000
  const h = Math.floor(d / 3600)
  const m = Math.floor((d % 3600) / 60)
  const s = Math.floor((d % 3600) % 60)
  return { h, m, s }
}

export const validate = (payload, setInvalidFields) => {
  let invalids = 0;
  const validationRules = {
    email: {
      required: true,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Email không hợp lệ"
    },
    password: {
      required: true,
      minLength: 3,
    },
    mobile: {
      required: true,
      pattern: /^[0-9]+$/,
      message: "Số điện thoại chỉ được chứa số"
    },
    firstname: {
      required: true,
      message: "Vui lòng nhập họ"
    },
    lastname: {
      required: true,
      message: "Vui lòng nhập tên"
    },
    confirmPassword: {
      required: true,
      message: "Vui lòng xác nhận mật khẩu"
    }
  };

  const errors = [];

  Object.keys(validationRules).forEach(key => {
    if (payload.hasOwnProperty(key)) {
      const rule = validationRules[key];
      const value = payload[key];

      if (rule.required && (!value || value.trim() === '')) {
        errors.push({ name: key, mes: rule.message });
        invalids++;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.push({ name: key, mes: rule.message });
        invalids++;
      }

      if (rule.minLength && value && value.length < rule.minLength) {
        errors.push({ name: key, mes: rule.message });
        invalids++;
      }
    }
  });

  // Special check for confirmPassword matching
  if (payload.password && payload.confirmPassword && 
      payload.password !== payload.confirmPassword) {
    errors.push({ name: 'confirmPassword', mes: 'Mật khẩu xác nhận không khớp' });
    invalids++;
  }

  setInvalidFields(errors);
  return invalids;
}

export const fotmatPrice = (number) => Math.round(number / 1000) * 1000

export const generateRange = (start, end) => {
  const length = end + 1 - start
  return Array.from({ length }, (_, index) => start + index)
}
export function getBase64(file) {
  if (!file) return ""
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}
export function getDaysInMonth(customTime, number) {
  const endDay = new Date(customTime)?.getDate() || new Date().getDate()
  const days = number || 15
  const endPreviousMonth = new Date(
    new Date(customTime)?.getFullYear(),
    new Date(customTime)?.getMonth(),
    0
  ).getDate()
  let day = 1
  let prevDayStart = 1
  const daysInMonths = []
  while (prevDayStart <= +endPreviousMonth) {
    const month = new Date().getMonth()
    const year = new Date().getFullYear()
    daysInMonths.push(
      `${year}-${month < 10 ? `0${month}` : month}-${
        prevDayStart < 10 ? "0" + prevDayStart : prevDayStart
      }`
    )
    prevDayStart += 1
  }
  while (day <= +endDay) {
    const month = new Date().getMonth() + 1
    const year = new Date().getFullYear()
    daysInMonths.push(
      `${year}-${month < 10 ? `0${month}` : month}-${
        day < 10 ? "0" + day : day
      }`
    )
    day += 1
  }
  return daysInMonths.filter(
    (el, index, self) => index > self.length - days - 2
  )
}
export function getMonthInYear(customTime, number) {
  const endMonth =
    new Date(customTime?.to).getMonth() + 1 || new Date().getMonth() + 1
  let month = 1
  const months = number || 8
  let startLastYear = 1
  const daysInMonths = []
  while (startLastYear <= 12) {
    const year = new Date().getFullYear()
    daysInMonths.push(
      `${year - 1}-${startLastYear < 10 ? `0${startLastYear}` : startLastYear}`
    )
    startLastYear += 1
  }
  while (month <= +endMonth) {
    const year = new Date().getFullYear()
    daysInMonths.push(`${year}-${month < 10 ? `0${month}` : month}`)
    month += 1
  }
  return daysInMonths.filter(
    (el, index, self) => index > self.length - months - 2
  )
}
export const getDaysInRange = (start, end) => {
  const startDateTime = new Date(start).getTime()
  const endDateTime = new Date(end).getTime()
  return (endDateTime - startDateTime) / (24 * 60 * 60 * 1000)
}
export const getMonthsInRange = (start, end) => {
  let months
  const d1 = new Date(start)
  const d2 = new Date(end)
  months = (d2.getFullYear() - d1.getFullYear()) * 12
  months -= d1.getMonth()
  months += d2.getMonth()
  return months <= 0 ? 0 : months
}
