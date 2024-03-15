import { INewUser } from "@/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { createUserAccount, signInAccount } from "../appwrite/api";

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
