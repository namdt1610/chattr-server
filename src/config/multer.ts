import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Thư mục lưu tệp
    },
    filename: function (req, file, cb) {
        const sanitized = file.originalname.replace(/\s+/g, '_')
        cb(null, Date.now() + '-' + sanitized) // Đặt tên tệp duy nhất
    },
})

export const upload = multer({ storage: storage })
