import { NextFunction, Response } from "express";
import multer from "multer";
import APP_CONSTANTS from "../constants";
import { CreateEmployeeDto } from "../dto/CreateEmployee";
import authorize from "../middleware/authorize";
import validationMiddleware from "../middleware/validationMiddleware";
import { EmployeeService } from "../services/EmployeeService";
import { AbstractController } from "../util/rest/controller";
import RequestWithUser from "../util/rest/request";
/**
 * Implementation of the EmployeeController route.
 *
 */
class EmployeeController extends AbstractController {

  private upload = multer({ dest: "./public/uploads/"});
  constructor(
    private employeeService: EmployeeService,
  ) {
    super(`${APP_CONSTANTS.apiPrefix}/employees`);
    this.initializeRoutes();
  }

  protected initializeRoutes = (): void => {
    this.router.get(
      `${this.path}`,
      authorize(["admin", "Engineer"]),
      this.asyncRouteHandler(this.getAllEmployees)
    );
    this.router.get(
      `${this.path}/:employeeId`,
      this.asyncRouteHandler(this.getEmployeeById)
    );
    this.router.post(
      `${this.path}`,
      validationMiddleware(CreateEmployeeDto),
       authorize(["admin"]),
       this.createEmployee
    );
    this.router.put(
      `${this.path}/:employeeId`,
      this.asyncRouteHandler(this.updateEmployee)
    );
    this.router.delete(
      `${this.path}/:employeeId`,
      this.asyncRouteHandler(this.deleteEmployee)
    );

    this.router.post(
      `${this.path}/upload`,
      this.upload.single("file"),
      this.asyncRouteHandler(this.uploadImage)
    );

    this.router.post(
      `${this.path}/login`,
       this.asyncRouteHandler(this.login)
    );
  }

  private getAllEmployees = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ) => {
    const data = await this.employeeService.getAllEmployees();
    response.send(
      this.fmt.formatResponse(data, Date.now() - request.startTime, "OK")
    );
  }

  private getEmployeeById = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ) => {
    const data = await this.employeeService.getEmployeeById(request.params.id);
    response.send(
      this.fmt.formatResponse(data, Date.now() - request.startTime, "OK")
    );
  }

  private createEmployee = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ) => {
    try {
      console.log(request.body)
      const data = await this.employeeService.createEmployee(request.body);
      //console.log(data);
      response.send(
        this.fmt.formatResponse(data, Date.now() - request.startTime, "OK")
      );
    } catch (err) {
      next(err);
    }
  }

  private updateEmployee = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ) => {
      const data = await this.employeeService.updateEmployee(request.params.employeeId, request.body);
      response.status(201).send(
        this.fmt.formatResponse(data, Date.now() - request.startTime, "OK")
      );
  }

  private deleteEmployee = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ) => {
      const data = await this.employeeService.deleteEmployee(request.params.employeeId);
      response.status(201).send(
        this.fmt.formatResponse(data, Date.now() - request.startTime, "OK")
      );
  }

  private uploadImage = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ) => {
    const filePath = `${APP_CONSTANTS.basePath}/${request.file.path.slice(7)}`;
    response.send(
      this.fmt.formatResponse(
        { filePath },
        Date.now() - request.startTime,
        "OK"
      )
    );
  }

  private login = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ) => {
    const data = await this.employeeService.employeeLogin(request.body.username, request.body.password);
    response.status(200).send(
      this.fmt.formatResponse(data, Date.now() - request.startTime,"OK")
    );
  }

}

export default EmployeeController;
