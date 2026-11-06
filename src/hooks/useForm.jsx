import React from 'react'

export const useForm = (initalObj) => {
  const [form, setForm] = React.useState(initalObj)

  const changed = ({target}) => {
    const { name, value } = target
    const updatedForm = {
      ...form,
      [name]: value
    }
    setForm(updatedForm)
  }

  const resetForm = () => setForm({ ...initalObj })

  return {
    form,
    changed,
    resetForm
  }
}
