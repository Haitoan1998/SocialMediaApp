import { INewPost, INewUser } from "@/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  createPost,
  createUserAccount,
  getRecentPosts,
  signInAccount,
  signOutAccount,
} from "../appwrite/api";
import { QUERY_KEYS } from "./queryKeys";

//hook createUserAccount
//sử dụng hook useMutation từ thư viện React Query để thực hiện một thay đổi dữ liệu, cụ thể là tạo một tài khoản người dùng mới.
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

//Hook này sử dụng hook useMutation từ thư viện React Query để thực hiện một thay đổi dữ liệu, cụ thể là đăng nhập vào một tài khoản.
export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

//Hook này sử dụng hook useMutation từ thư viện React Query để thực hiện một thay đổi dữ liệu, cụ thể là xóa session để đăng xuất.
export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

//Hook này sử dụng hook useMutation từ thư viện React Query để thực hiện một thay đổi dữ liệu, cụ thể là tạo post
export const useCreatePost = () => {
  const queryClient = useQueryClient(); //truy cập vào instance của QueryClient
  // QueryClient là một đối tượng quản lý trạng thái của các truy vấn (queries)
  // và các mutation trong ứng dụng React của bạn khi sử dụng React Query.
  // Nó cung cấp các phương thức để tạo, xóa, hoặc thực hiện các thao tác liên quan đến truy vấn và mutation.
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post), //gọi đến hàm createPost
    //hàm gọi khi mutation thành công
    onSuccess: () => {
      //invalidateQueries đánh dấu truy vấn là ko hợp lệ, làm chúng thực hiện lại khi cần thiết
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS], //cho biết rằng truy vấn lấy các bài viết gần đây là ko hợp lệ và gọi lại fn để làm mới
      });
    },
  });
};

//Hook này sử dụng hook useMutation từ thư viện React Query để thực hiện một thay đổi dữ liệu, cụ thể là lấy bài post mới nhất
export const useGetRecentPosts = () => {
  //useQuery trong React Query là một hook được cung cấp bởi thư viện React Query để thực hiện các truy vấn dữ liệu trong ứng dụng React
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS], //xác định khóa của truy vấn
    queryFn: getRecentPosts,
  });
};
