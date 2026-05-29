$(document).ready(function () {
  // 2. Bắt sự kiện click vào các thẻ <a> trong sidebar
  $("#sidebar ul li a").click(function (event) {
    // Chặn hành vi tự tải lại trang của thẻ <a>
    event.preventDefault();

    // 3. Lấy giá trị cần lọc từ thẻ <a> vừa click
    // $(this) đại diện cho chính thẻ <a> đó
    let filterValue = $(this).attr("data-filter");

    // 4. Duyệt qua toàn bộ các thẻ có class là .card
    $(".card").each(function () {
      // Lấy danh mục của từng card
      let category = $(this).attr("data-category");

      // 5. Kiểm tra điều kiện để hiển thị hoặc ẩn
      if (
        filterValue === "all" ||
        (category && category.includes(filterValue))
      ) {
        // Dùng .fadeIn() thay vì .show() để có hiệu ứng chuyển cảnh mượt mà
        $(this).fadeIn(300);
      } else {
        // Ẩn các card không khớp
        $(this).hide();
      }
    });
  });

  // ===== RESERVATION FORM HANDLING =====
  // Xử lý chọn khung giờ
  $(".time-slot").click(function (event) {
    event.preventDefault();
    
    // Xóa class active từ tất cả time-slot
    $(".time-slot").removeClass("active");
    
    // Thêm class active vào time-slot được click
    $(this).addClass("active");
    
    // Lưu giá trị giờ vào hidden input
    let selectedTime = $(this).attr("data-time");
    $("#selected-time").val(selectedTime);
  });

  // Hàm lưu dữ liệu vào localStorage
  function saveReservationToLocalStorage(formData) {
    // Lấy danh sách đặt bàn từ localStorage (nếu có)
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    
    // Thêm timestamp (thời gian thực)
    formData.timestamp = new Date().toLocaleString("vi-VN");
    formData.id = Date.now(); // ID duy nhất cho mỗi đặt bàn
    
    // Thêm vào danh sách
    reservations.push(formData);
    
    // Lưu lại vào localStorage
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }

  // Hàm hiển thị danh sách đặt bàn
  function displayReservations() {
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    let listHTML = "";
    
    if (reservations.length === 0) {
      listHTML = "<p style='color: #999; text-align: center;'>Chưa có đặt bàn nào</p>";
    } else {
      listHTML = "<table style='width: 100%; border-collapse: collapse;'>";
      listHTML += "<thead style='background: #C96A2B; color: white;'>";
      listHTML += "<tr><th style='padding: 10px; border: 1px solid #ddd;'>Tên</th>";
      listHTML += "<th style='padding: 10px; border: 1px solid #ddd;'>SDT</th>";
      listHTML += "<th style='padding: 10px; border: 1px solid #ddd;'>Ngày</th>";
      listHTML += "<th style='padding: 10px; border: 1px solid #ddd;'>Giờ</th>";
      listHTML += "<th style='padding: 10px; border: 1px solid #ddd;'>Số khách</th>";
      listHTML += "<th style='padding: 10px; border: 1px solid #ddd;'>Thời gian đặt</th>";
      listHTML += "<th style='padding: 10px; border: 1px solid #ddd;'>Hành động</th></tr>";
      listHTML += "</thead><tbody>";
      
      reservations.forEach(function(res, index) {
        listHTML += "<tr style='border-bottom: 1px solid #ddd;'>";
        listHTML += "<td style='padding: 10px;'>" + res.name + "</td>";
        listHTML += "<td style='padding: 10px;'>" + res.phone + "</td>";
        listHTML += "<td style='padding: 10px;'>" + res.date + "</td>";
        listHTML += "<td style='padding: 10px;'>" + res.time + "</td>";
        listHTML += "<td style='padding: 10px;'>" + res.guestCount + "</td>";
        listHTML += "<td style='padding: 10px;'>" + res.timestamp + "</td>";
        listHTML += "<td style='padding: 10px;'><button class='delete-btn' data-id='" + res.id + "' style='background: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;'>Xóa</button></td>";
        listHTML += "</tr>";
      });
      
      listHTML += "</tbody></table>";
      
      // Thêm nút xóa toàn bộ
      listHTML += "<div style='margin-top: 15px;'><button id='clear-all-btn' style='background: #f57c00; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;'>Xóa tất cả</button></div>";
    }
    
    $("#reservations-list").html(listHTML);
    
    // Xử lý xóa từng item
    $(".delete-btn").on("click", function() {
      let id = $(this).attr("data-id");
      deleteReservation(id);
    });
    
    // Xử lý xóa toàn bộ
    $("#clear-all-btn").on("click", function() {
      if (confirm("Bạn chắc chắn muốn xóa toàn bộ dữ liệu?")) {
        localStorage.removeItem("reservations");
        displayReservations();
      }
    });
  }

  // Hàm xóa một bản ghi
  function deleteReservation(id) {
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    reservations = reservations.filter(function(res) {
      return res.id != id;
    });
    localStorage.setItem("reservations", JSON.stringify(reservations));
    displayReservations();
  }

  // Xử lý submit form
  $("#reservation-form").on("submit", function (event) {
    event.preventDefault();
    
    // Kiểm tra xem đã chọn khung giờ chưa
    if ($("#selected-time").val() === "") {
      alert("Vui lòng chọn khung giờ!");
      return;
    }
    
    // Lấy dữ liệu form
    let formData = {
      name: $("#customer-name").val(),
      phone: $("#phone").val(),
      guestCount: $("#guest-count").val(),
      date: $("#reservation-date").val(),
      time: $("#selected-time").val(),
      seatingArea: $("#seating-area").val(),
      notes: $("#notes").val()
    };
    
    // Kiểm tra dữ liệu hợp lệ
    if (!formData.name || !formData.phone || !formData.guestCount || !formData.date || !formData.seatingArea) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    // Lưu vào localStorage
    saveReservationToLocalStorage(formData);
    
    // Hiển thị thông báo thành công
    alert("Đặt bàn thành công!\n\nThông tin đặt bàn:\n" +
      "Tên: " + formData.name + "\n" +
      "SDT: " + formData.phone + "\n" +
      "Số khách: " + formData.guestCount + "\n" +
      "Ngày: " + formData.date + "\n" +
      "Giờ: " + formData.time + "\n" +
      "Khu vực: " + formData.seatingArea);
    
    // Cập nhật danh sách đặt bàn
    displayReservations();
    
    // Reset form sau khi submit thành công
    this.reset();
    $(".time-slot").removeClass("active");
    $("#selected-time").val("");
  });

  // Hiển thị danh sách khi trang tải
  displayReservations();
});
