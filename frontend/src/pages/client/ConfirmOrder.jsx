import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiConfirmOrder } from "apis";
import Swal from "sweetalert2";
import { Loading } from "components";

const ConfirmOrder = () => {
  const { oid } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const confirmOrder = async () => {
      try {
        setIsLoading(true);
        const response = await apiConfirmOrder(oid);
        
        if (response.success) {
          Swal.fire({
            title: "Cảm ơn bạn!",
            text: "Đơn hàng của bạn đã được xác nhận thành công.",
            icon: "success",
            confirmButtonText: "Tiếp tục mua sắm",
          }).then(() => {
            navigate("/");
          });
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: response.message || "Không thể xác nhận đơn hàng.",
            icon: "error",
            confirmButtonText: "Quay lại trang chủ",
          }).then(() => {
            navigate("/");
          });
        }
      } catch (error) {
        console.error("Lỗi khi xác nhận đơn hàng:", error);
        Swal.fire({
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi xác nhận đơn hàng.",
          icon: "error",
          confirmButtonText: "Quay lại trang chủ",
        }).then(() => {
          navigate("/");
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (oid) {
      confirmOrder();
    } else {
      navigate("/");
    }
  }, [oid, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return null; // Component will redirect after confirmation
};

export default ConfirmOrder;