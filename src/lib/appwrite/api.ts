import { ID, Query } from "appwrite";

import { INewPost, INewUser } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { toast } from "@/components/ui/use-toast";

//create account
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    //get avatars URL
    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.name,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error: any) {
    return toast({
      title: error.message,
    });
  }
}

//save user to database
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databasesId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (error: any) {
    return toast({
      title: error.message,
    });
  }
}

//singin
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (error) {
    console.log(error);
  }
}

//Get the currently logged in user.
// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser: any = await databases.listDocuments(
      appwriteConfig.databasesId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

//singout
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId, //id của bucket
      ID.unique(), // id duy nhất appwrite
      file // file cần tạo
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}
// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      //xem trước tập tin vừa tạo trả về Url ảnh
      appwriteConfig.storageId, //id của bucket
      fileId,
      2000, //width
      2000, //height
      "top", //cắt ảnh ở đâu
      100 // chất lượng hình ảnh
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    //xóa file bằng id của nó
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

//create post
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id); //lấy ra THÔNG TIN url file vừa tạo
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id); // nếu ko có thì xóa file theo id duy nhất file đó
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || []; //sửa lại tags

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databasesId, // id của db appwrite
      appwriteConfig.postCollectionId, // id của bảng post appwrite
      ID.unique(), //id bài post là duy nhất
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      } // các thông tin chuyền lên
    );
    if (!newPost) {
      //nếu ko tạo được thì xóa file
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

//lấy bài viết mới nhất
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databasesId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}
