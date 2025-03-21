import { apiGetDashboard } from "apis"
import BoxInfo from "components/chart/BoxInfo"
import CustomChart from "components/chart/CustomChart"
import React, { useEffect, useState } from "react"
import { AiOutlineUserAdd } from "react-icons/ai"
import { formatMoney } from "utils/helpers"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import moment from "moment";
import { useOutletContext } from "react-router"

ChartJS.register(ArcElement, Tooltip, Legend)
const Dashboard = () => {
  const [data, setData] = useState()
  const [isMonth, setIsMonth] = useState(false)
  const { darkMode } = useOutletContext()
  const [customTime, setCustomTime] = useState({
    from: "",
    to: "",
  })
  const fetchDataDashboard = async (params) => {
    const response = await apiGetDashboard(params)
    if (response.success) setData(response.data)
  }
  useEffect(() => {
    const type = isMonth ? "MTH" : "D";
    const params = { type };

    if (customTime.from)
      params.from = moment(customTime.from, "DD/MM/YYYY").format("YYYY-MM-DD");
    if (customTime.to)
      params.to = moment(customTime.to, "DD/MM/YYYY").format("YYYY-MM-DD");

    fetchDataDashboard(params);
  }, [isMonth, customTime]);
  const handleCustomTime = () => {
    setCustomTime({ from: "", to: "" })
  }
  const pieData = {
    labels: ["Tổng đơn đã hủy", "Tổng đơn thành công"],
    datasets: [
      {
        label: "Tổng đơn",
        data: [
          data?.pieData?.find((el) => el.status === "Cancelled")?.sum,
          data?.pieData?.find((el) => el.status === "Succeed")?.sum,
        ],
        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  }
  return (
    <div className={`w-full flex flex-col gap-4 relative ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-900"}`}>
      <div className="h-[69px] w-full"></div>
      <div className={`p-4 border-b w-full fixed top-0 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quát</h1>
      </div>
      <div className="px-4">
        <div className="grid grid-cols-4 gap-4">
          <BoxInfo
            text="Số thành viên mới"
            icon={<AiOutlineUserAdd size={22} />}
            number={data?.users?.[0]?.count || 0}
            className="border-blue-500 text-white bg-blue-500"
          />
          <BoxInfo
            text="Số tiền đã được thanh toán"
            icon={<img src="/dong.svg" className="h-6 object-contain" />}
            number={
              data?.totalSuccess?.[0]?.count
                ? formatMoney(Math.round(data?.totalSuccess[0]?.count * 25000))
                : 0
            }a
            className="border-green-500 text-white bg-green-500"
          />
          <BoxInfo
            text="Số tiền chưa thanh toán"
            icon={<img src="/dong.svg" className="h-6 object-contain" />}
            number={
              data?.totalFailed?.[0]?.count
                ? formatMoney(Math.round(data?.totalFailed[0]?.count * 25000))
                : 0
            }
            className="border-orange-500 text-white bg-orange-500"
          />
          <BoxInfo
            text="Số sản phẩm đã bán"
            number={data?.soldQuantities?.[0]?.count || 0}
            className="border-yellow-500 text-white bg-yellow-500"
          />
        </div>
        <div className="mt-6 grid grid-cols-10 gap-4">
          <div className="col-span-7 min-h-[500px] border flex flex-col gap-4 relative rounded-md flex-auto p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-8">
                <span>{`Thông kê doanh thu theo ${
                  isMonth ? "tháng" : "ngày"
                }`}</span>
                <div className="flex items-center font-thin gap-8">
                  <span className="flex items-center gap-2">
                    <label htmlFor="from">Từ</label>
                    <input
                      type="date"
                      value={customTime.from}
                      onChange={(e) =>
                        setCustomTime((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      id="from"
                    />
                  </span>
                  <span className="flex items-center gap-2">
                    <label htmlFor="from">Đến</label>
                    <input
                      type="date"
                      value={customTime.to}
                      onChange={(e) =>
                        setCustomTime((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      id="to"
                    />
                  </span>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md border-blue-500 text-blue-500 border`}
                    onClick={handleCustomTime}
                  >
                    Mặc định
                  </button>
                </div>
              </span>
              <span className="flex items-center">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md border hover:border-main-blue ${
                    isMonth ? "" : "text-white font-semibold bg-main"
                  }`}
                  onClick={() => setIsMonth(false)}
                >
                  Ngày
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md border hover:border-main-blue ${
                    isMonth ? "text-white font-semibold bg-main" : ""
                  }`}
                  onClick={() => setIsMonth(true)}
                >
                  Tháng
                </button>
              </span>
            </div>
            {data?.chartData && (
              <CustomChart
                customTime={customTime}
                isMonth={isMonth}
                data={data?.chartData}
              />
            )}
          </div>
          <div className="col-span-3 rounded-md border p-4 text-center">
            <span className="font-bold gap-8">
              Thống kê tổng đơn đã huỷ và đơn thành công
            </span>
            <div>
              <Pie data={pieData} />;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard
