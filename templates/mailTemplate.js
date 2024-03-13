const htmlTemp = async (options) => {
    return (
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
            <style>
                /* Reset styles */
                body, h1, p {
                    margin: 0;
                    padding: 0;
                }
        
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    padding: 20px;
                }
        
                /* Container styles */
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
        
                /* Header styles */
                .header {
                    background-color: #007bff;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 5px 5px 0 0;
                }
        
                /* Content styles */
                .content {
                    padding: 20px;
                }
        
                /* Button styles */
                .btn {
                    display: inline-block;
                    background-color: #007bff;
                    color: #fff;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                }
        
                /* Footer styles */
                .footer {
                    background-color: #f8f9fa;
                    color: #6c757d;
                    text-align: center;
                    padding: 10px;
                    border-radius: 0 0 5px 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OTP VERIFICATION</h1>
                </div>
                <div class="content">
                    <p>Hii Buddy ${options.email}.</p>
                    <p>please don't disclose this OTP to anyone.</p>
                    <p class="btn">OTP IS ${options.otp}</p>
                </div>
                <div class="footer">
                    <p>For assistance, please contact support@example.com</p>
                </div>
            </div>
        </body>
        </html>
        `
    )
}

module.exports = htmlTemp