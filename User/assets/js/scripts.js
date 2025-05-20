// Retrieve user data from localStorage, parsed from JSON
// This data is stored after a user logs in
const user = JSON.parse(localStorage.getItem('user'));

// Update DOM with user information if user data exists      
if (user) {
    document.getElementById('userName').textContent = user.firstName;
    document.getElementById('userName1').textContent = user.firstName;
    document.getElementById('userAvatar').src = user.image;
}
$(document).ready(function () {
    let currentPage = 1;
    let limit = 8;
    let totalUsers = 0;
    let searchTerm = '';
    let sortBy = 'firstName';
    let sortOrder = 'asc';
    let allUsers = [];
    let isSidebarExpanded = false;

    // Event listener for logo click to toggle sidebar expansion
    $('.logo').on('click', function () {
        isSidebarExpanded = !isSidebarExpanded;
        $('#sidebar').toggleClass('expanded', isSidebarExpanded);
        $('#content').toggleClass('expanded', isSidebarExpanded);
    });

    // Function to fetch users from the API
    function fetchUsers(page = 1, search = '') {
        let skip = (page - 1) * limit;
        // Construct API URL based on whether a search term is provided
        let url = search
            ? `https://dummyjson.com/users/search?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`
            : `https://dummyjson.com/users?limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${sortOrder}`;

        // Make an AJAX GET request to fetch user data
        $.getJSON(url, function (data) {
            totalUsers = data.total;
            allUsers = data.users;
            $('#totalUsers').text(totalUsers);
            $('#totalMembers').text(totalUsers);
            $('#totalEntries').text(totalUsers);
            let activeCount = data.users.filter(user => user.role === 'admin').length;
            $('#activeNow').text(activeCount);

            // Custom sorting for 'company.name' or 'address.country' fields
            if (sortBy === 'company.name' || sortBy === 'address.country') {
                allUsers.sort((a, b) => {
                    let aValue = sortBy === 'company.name'
                        ? (a.company?.name || '').toLowerCase()
                        : (a.address?.country || '').toLowerCase();
                    let bValue = sortBy === 'company.name'
                        ? (b.company?.name || '').toLowerCase()
                        : (b.address?.country || '').toLowerCase();
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                });
            }

            displayUsers(allUsers);
            updatePagination(page, Math.ceil(totalUsers / limit));
            $('#showingStart').text(skip + 1);
            $('#showingEnd').text(Math.min(skip + limit, totalUsers));
        });
    }

    // Function to display users in the table
    function displayUsers(users) {
        $('#userTableBody').empty();
        users.forEach(user => {
            $('#userTableBody').append(`
            <tr>
              <td><img src="${user.image || 'https://via.placeholder.com/30'}" class="avatar" alt="avatar"> ${user.firstName} ${user.lastName}</td>
              <td>${user.company?.name || 'N/A'}</td>
              <td>${user.phone || 'N/A'}</td>
              <td>${user.email}</td>
              <td>${user.address?.country || 'N/A'}</td>
              <td>${user.role || 'N/A'}</td>
            </tr>
          `);
        });
    }

    // Function to update pagination controls
    function updatePagination(currentPage, totalPages) {
        $('#pagination').empty();
        let maxPagesToShow = 5;
        // Calculate start and end pages for pagination
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        $('#pagination').append(`<li class="page-item"><a class="page-links" href="#" data-page="${currentPage - 1}"><i
        class="fas fa-chevron-left"></i></a></li>`);


        for (let i = startPage; i <= endPage; i++) {
            let activeClass = i === currentPage ? 'active' : '';
            $('#pagination').append(`<li class="page-item ${activeClass}"><a class="page-links" href="#" data-page="${i}">${i}</a></li>`);
        }

        $('#pagination').append(`<li class="page-item"><a class="page-links" href="#" data-page="${currentPage + 1}"><i
        class="fas fa-chevron-right"></i></a></li>`);

        // Event listener for pagination clicks
        $('.page-links').on('click', function (e) {
            e.preventDefault();
            currentPage = parseInt($(this).data('page'));
            fetchUsers(currentPage, searchTerm);
        });
    }

    // Initial fetch of users when the page loads
    fetchUsers();

    // Search input event listener with debounce
    let searchTimeout;
    $('#searchInput').on('input', function () {
        clearTimeout(searchTimeout);
        searchTerm = $(this).val();
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            fetchUsers(currentPage, searchTerm);
        }, 500);
    });

    // Sort select event listener
    $('#sortSelect').on('change', function () {
        sortBy = $(this).val();
        currentPage = 1;
        fetchUsers(currentPage, searchTerm);
    });
});