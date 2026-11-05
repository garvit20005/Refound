// Gets a readable message from an Axios error
export default function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Something went wrong';
}
