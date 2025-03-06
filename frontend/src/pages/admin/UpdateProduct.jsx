import { InputForm, MarkdownEditor, Select, Button, Loading } from 'components'
import React, { memo, useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { validate, getBase64 } from 'utils/helpers'
import { toast } from 'react-toastify'
import { apiUpdateProduct } from 'apis'
import { showModal } from 'store/app/appSlice'
import { useSelector, useDispatch } from 'react-redux'

const UpdateProduct = ({ editProduct, render, setEditProduct }) => {
    const { categories } = useSelector(state => state.app)
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm()
    const [payload, setPayload] = useState({
        description: ''
    })
    const [preview, setPreview] = useState({
        thumb: null,
        images: []
    })

    useEffect(() => {
        reset({
            title: editProduct?.title || '',
            price: editProduct?.price || '',
            quantity: editProduct?.quantity || '',
            color: editProduct?.color || '',
            category: editProduct?.category || '',
            brand: editProduct?.brand?.toLowerCase() || '',
        })
        setPayload({ description: typeof editProduct?.description === 'object' ? editProduct?.description?.join(', ') : editProduct?.description })
        setPreview({
            thumb: editProduct?.thumb || '',
            images: editProduct?.images || []
        })
    }, [editProduct])

    const [invalidFields, setInvalidFields] = useState([])
    const changeValue = useCallback((e) => {
        setPayload(e)
    }, [payload])
    const handlePreviewThumb = async (file) => {
        const base64Thumb = await getBase64(file)
        setPreview(prev => ({ ...prev, thumb: base64Thumb }))
    }
    const handlePreviewImages = async (files) => {
        const imagesPreview = []
        for (let file of files) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                toast.warning('File not supported!')
                return
            }
            const base64 = await getBase64(file)
            imagesPreview.push(base64)
        }
        setPreview(prev => ({ ...prev, images: imagesPreview }))
    }
    useEffect(() => {
        if (watch('thumb') instanceof FileList && watch('thumb').length > 0)
            handlePreviewThumb(watch('thumb')[0])
    }, [watch('thumb')])
    useEffect(() => {
        if (watch('images') instanceof FileList && watch('images').length > 0)
            handlePreviewImages(watch('images'))
    }, [watch('images')])

    const handleUpdateProduct = async (data) => {
      const invalids = validate(payload, setInvalidFields);
      if (invalids === 0) {
        if (data.category)
          data.category = categories?.find(
            (el) => el.title === data.category
          )?.title;

        const finalPayload = { ...data, ...payload };
        finalPayload.thumb =
          data?.thumb?.length === 0 ? preview.thumb : data.thumb[0];

        const validImages =
          data.images?.length === 0
            ? preview.images
            : data.images.filter((image) => image.size > 0);

        finalPayload.images = validImages;

        const formData = new FormData();
        for (let [key, value] of Object.entries(finalPayload)) {
          if (key === "images") {

            for (let image of value) {
              formData.append("images", image);
            }
          } else {
            formData.append(key, value);
          }
        }

        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

        const response = await apiUpdateProduct(formData, editProduct._id);

        dispatch(showModal({ isShowModal: false, modalChildren: null }));

        if (response.success) {
          toast.success(response.mes);
          render();
          setEditProduct(null);
        } else {
          toast.error(response.mes);
        }
      }
    };

    return (
      <div className="w-full flex flex-col gap-4 relative">
        <div className="h-[69px] w-full"></div>
        <div className="p-4 border-b bg-gray-100 flex justify-between items-center right-0 left-[327px] fixed top-0">
          <h1 className="text-3xl font-bold tracking-tight">
            Cập nhật sản phẩm
          </h1>
          <span
            className="text-main hover:underline cursor-pointer"
            onClick={() => setEditProduct(null)}
          >
            Quay lại
          </span>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit(handleUpdateProduct)}>
            <InputForm
              label="Tên sản phẩm"
              register={register}
              errors={errors}
              id="title"
              validate={{
                required: "Need fill this field",
              }}
              fullWidth
              placeholder="Nhập tên sản phẩm"
            />
            <div className="w-full my-6 flex gap-4">
              <InputForm
                label="Giá tiền"
                register={register}
                errors={errors}
                id="price"
                validate={{
                  required: "Need fill this field",
                }}
                style="flex-auto"
                placeholder="Giá..."
                type="number"
              />
              <InputForm
                label="Số lượng"
                register={register}
                errors={errors}
                id="quantity"
                validate={{
                  required: "Need fill this field",
                }}
                style="flex-auto"
                placeholder="..."
                type="number"
              />
              <InputForm
                label="Màu sắc"
                register={register}
                errors={errors}
                id="color"
                validate={{
                  required: "Need fill this field",
                }}
                style="flex-auto"
                placeholder="Đen,..."
              />
            </div>
            <div className="w-full my-6 flex gap-4">
              <Select
                label="Loại sản phẩm"
                options={categories
                  ?.slice() // Tạo một bản sao của mảng
                  ?.sort((a, b) => a.title.localeCompare(b.title)) // Sort categories alphabetically
                  ?.map((el) => ({ code: el.title, value: el.title }))}
                register={register}
                id="category"
                validate={{ required: "Need fill this field" }}
                style="flex-auto"
                errors={errors}
                fullWidth
              />
              <Select
                label="Thương hiệu"
                options={categories
                  ?.find((el) => el.title === watch("category"))
                  ?.brand?.slice()?.sort((a, b) => a.localeCompare(b)) // Sort brands alphabetically
                  .map((el) => ({ code: el.toLowerCase(), value: el }))}
                register={register}
                id="brand"
                style="flex-auto"
                errors={errors}
                fullWidth
              />
            </div>
            <MarkdownEditor
              name="description"
              changeValue={changeValue}
              label="Mô tả"
              invalidFields={invalidFields}
              setInvalidFields={setInvalidFields}
              value={payload.description}
            />
            <div className="flex flex-col gap-2 mt-8">
              <label className="font-semibold" htmlFor="thumb">
                Ảnh đại diện
              </label>
              <input type="file" id="thumb" {...register("thumb")} />
              {errors["thumb"] && (
                <small className="text-xs text-red-500">
                  {errors["thumb"]?.message}
                </small>
              )}
            </div>
            {preview.thumb && (
              <div className="my-4">
                <img
                  src={preview.thumb}
                  alt="thumbnail"
                  className="w-[200px] object-contain"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 mt-8">
              <label className="font-semibold" htmlFor="products">
                Hình ảnh sản phẩm
              </label>
              <input
                type="file"
                id="products"
                multiple
                {...register("images")}
              />
              {errors["images"] && (
                <small className="text-xs text-red-500">
                  {errors["images"]?.message}
                </small>
              )}
            </div>
            {preview.images.length > 0 && (
              <div className="my-4 flex w-full gap-3 flex-wrap">
                {preview.images?.map((el, idx) => (
                  <div key={idx} className="w-fit relative">
                    <img
                      src={el}
                      alt="product"
                      className="w-[200px] object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="my-6">
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </div>
      </div>
    );
}

export default memo(UpdateProduct)