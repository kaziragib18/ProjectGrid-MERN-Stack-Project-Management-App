import { SignInSchema } from '@/lib/schema'
import React from 'react'
import { useForm } from 'react-hook-form'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Define the type for the form data using zod's infer utility
// This will automatically infer the type from the SignInSchema
// This ensures that the form data will match the schema defined in SignInSchema
type SignInFormData = z.infer<typeof SignInSchema>

const SignIn = () => {
  // Initialize the form with react-hook-form using the SignInSchema for validation 
  // The form will have two fields: email and password
  // The resolver will use zod to validate the form data against the schema
  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleOnSubmit = (data: SignInFormData) => {
    // Handle form submission
    // You can send the data to your API or perform any other action
    console.log('Form submitted:', data);
  } 

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-md p-6 bg-white shadow-xl'>
        <CardHeader className='mb-4'>
          <CardTitle className='text-center text-2xl font-bold'>Sign In</CardTitle>
          <CardDescription className='text-center text-sm text-muted-foreground'>
            Please enter your email and password to sign in.  
          </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleOnSubmit)} className='space-y-5'>
                <FormField control={form.control} 
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='email@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} 
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='*******' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type='submit' className='w-full bg-black text-white hover:bg-blue-400 transition-colors duration-200'>
                  Sign In</Button>

              </form>
            </Form>
          </CardContent>

      </Card>
    </div>
  )
}

export default SignIn