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
    labels: ["Tổng đơn đã hủy", "Tổng đơn đặt hàng"],
    datasets: [
      {
        label: "Tổng đơn",
        data: [
          data?.pieData?.find((el) => el.status === "Cancelled")?.sum,
          data?.pieData?.map((el) => el.sum).reduce((a,b) => a+b, 0)
        ],
        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  }
  return (
    <div className={`
      w-full h-full rounded-2xl backdrop-blur-xl shadow-2xl 
      ${darkMode 
        ? "bg-gray-800/60 border-gray-700/50 text-gray-200" 
        : "bg-white/60 border-gray-200/50 text-gray-900"}
      border p-4 space-y-4
    `}>
      <div className={`
        p-4 border-b w-full 
        ${darkMode 
          ? "bg-gray-800/60 border-gray-700/50" 
          : "bg-white/60 border-gray-200/50"}
      `}>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quát</h1>
      </div>
      
      <div className="px-4 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <BoxInfo
            text="Số thành viên mới"
            icon={<AiOutlineUserAdd size={22} />}
            number={data?.users?.[0]?.count || 0}
            className={`
              border rounded-xl 
              ${darkMode 
                ? "bg-blue-900/50 border-blue-700/50 text-blue-200" 
                : "bg-blue-500/20 border-blue-500/50 text-blue-700"}
            `}
          />
          <BoxInfo
            text="Số tiền đã được thanh toán"
            icon={<img src="/dong.svg" className="h-6 object-contain" />}
            number={
              data?.totalSuccess?.[0]?.count
                ? formatMoney(Math.round(data?.totalSuccess[0]?.count))
                : 0
            }
            className={`
              border rounded-xl 
              ${darkMode 
                ? "bg-green-900/50 border-green-700/50 text-green-200" 
                : "bg-green-500/20 border-green-500/50 text-green-700"}
            `}
          />
          <BoxInfo
            text="Số tiền chưa thanh toán"
            icon={<img src="/dong.svg" className="h-6 object-contain" />}
            number={
              data?.totalFailed?.[0]?.count
                ? formatMoney(Math.round(data?.totalFailed[0]?.count))
                : 0
            }
            className={`
              border rounded-xl 
              ${darkMode 
                ? "bg-orange-900/50 border-orange-700/50 text-orange-200" 
                : "bg-orange-500/20 border-orange-500/50 text-orange-700"}
            `}
          />
          <BoxInfo
            text="Số sản phẩm đã bán"
            number={data?.soldQuantities?.[0]?.count || 0}
            className={`
              border rounded-xl 
              ${darkMode 
                ? "bg-yellow-900/50 border-yellow-700/50 text-yellow-200" 
                : "bg-yellow-500/20 border-yellow-500/50 text-yellow-700"}
            `}
          />
        </div>
        
        <div className="grid grid-cols-10 gap-4">
          <div className={`
            col-span-7 min-h-[500px] rounded-xl border 
            ${darkMode 
              ? "bg-gray-900/50 border-gray-700/50" 
              : "bg-white/50 border-gray-200/50"}
            flex flex-col gap-4 p-4
          `}>
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
                      className={`
                        rounded-md p-1 
                        ${darkMode 
                          ? "bg-gray-700 text-gray-200 border-gray-600" 
                          : "bg-white border-gray-300"}
                      `}
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
                      className={`
                        rounded-md p-1 
                        ${darkMode 
                          ? "bg-gray-700 text-gray-200 border-gray-600" 
                          : "bg-white border-gray-300"}
                      `}
                    />
                  </span>
                  <button
                    type="button"
                    className={`
                      px-4 py-2 rounded-md border 
                      ${darkMode 
                        ? "border-blue-500 text-blue-500 hover:bg-blue-900/50" 
                        : "border-blue-500 text-blue-500 hover:bg-blue-100"}
                    `}
                    onClick={handleCustomTime}
                  >
                    Mặc định
                  </button>
                </div>
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  className={`
                    px-4 py-2 rounded-md border 
                    ${darkMode 
                      ? (isMonth 
                          ? "border-gray-600 text-gray-400" 
                          : "bg-blue-900/50 border-blue-500 text-blue-500")
                      : (isMonth 
                          ? "border-gray-300 text-gray-500" 
                          : "bg-blue-500 text-white")}
                  `}
                  onClick={() => setIsMonth(false)}
                >
                  Ngày
                </button>
                <button
                  type="button"
                  className={`
                    px-4 py-2 rounded-md border 
                    ${darkMode 
                      ? (isMonth 
                          ? "bg-blue-900/50 border-blue-500 text-blue-500" 
                          : "border-gray-600 text-gray-400")
                      : (isMonth 
                          ? "bg-blue-500 text-white" 
                          : "border-gray-300 text-gray-500")}
                  `}
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
          <div className={`
            col-span-3 rounded-xl border 
            ${darkMode 
              ? "bg-gray-900/50 border-gray-700/50" 
              : "bg-white/50 border-gray-200/50"}
            p-4 text-center
          `}>
            <span className="font-bold gap-8">
              Thống kê tổng đơn đã đặt và đơn huỷ
            </span>
            <div>
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard